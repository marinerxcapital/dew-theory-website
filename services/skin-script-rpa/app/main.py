"""FastAPI entrypoint — domain-specific fulfillment API only."""
from __future__ import annotations

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse

from app.config import settings
from app.domain.models import CreateJobRequest, InventoryCheckRequest, InventoryRow, JobResponse
from app.jobs.store import job_store
from app.jobs.worker import FulfillmentWorker
from app.security.hmac import verify_hmac

app = FastAPI(title="Dew Theory Skin Script RPA", version="0.1.0")
worker = FulfillmentWorker()


@app.middleware("http")
async def hmac_middleware(request: Request, call_next):
    if request.url.path in ("/health", "/ready", "/docs", "/openapi.json", "/redoc"):
        return await call_next(request)
    body = await request.body()

    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}

    request._receive = receive  # type: ignore[attr-defined]
    verify_hmac(request, body)
    return await call_next(request)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/ready")
async def ready():
    # Readiness never places an order
    configured = bool(settings.hmac_secret) and bool(settings.portal_base_url)
    return {"ready": configured, "rpa_enabled": settings.rpa_enabled, "dry_run": settings.dry_run}


@app.post("/v1/fulfillment/jobs", response_model=JobResponse)
async def create_job(req: CreateJobRequest):
    payload = req.model_dump()
    if req.dry_run is not None:
        payload["dry_run"] = req.dry_run
    else:
        payload["dry_run"] = settings.dry_run

    rec = job_store.create(payload)
    rec.status = "processing"
    job_store.update(rec.id, status="processing", attempt_count=rec.attempt_count + 1)

    result = await worker.run_job(payload)

    if result.get("status") == "submitted":
        job_store.update(rec.id, status="submitted", supplier_order_id=result.get("supplier_order_id"))
        return JobResponse(
            job_id=rec.id,
            status="submitted",
            supplier_order_id=result.get("supplier_order_id"),
            dry_run=False,
            metadata=result.get("metadata", {}),
        )
    if result.get("status") == "dry_run_ready":
        job_store.update(rec.id, status="dry_run_ready")
        return JobResponse(job_id=rec.id, status="dry_run_ready", dry_run=True, metadata=result.get("metadata", {}))
    if result.get("status") == "blocked":
        job_store.update(
            rec.id,
            status="blocked",
            error_code=result.get("error_code"),
            error_message=result.get("error_message"),
        )
        return JSONResponse(
            status_code=422,
            content=JobResponse(
                job_id=rec.id,
                status="blocked",
                error_code=result.get("error_code"),
                error_message=result.get("error_message"),
            ).model_dump(),
        )

    job_store.update(rec.id, status="failed", error_message="unknown")
    raise HTTPException(status_code=500, detail="Fulfillment failed")


@app.get("/v1/fulfillment/jobs/{job_id}", response_model=JobResponse)
async def get_job(job_id: str):
    rec = job_store.get(job_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Job not found")
    return JobResponse(
        job_id=rec.id,
        status=rec.status,
        supplier_order_id=rec.supplier_order_id,
        error_code=rec.error_code,
        error_message=rec.error_message,
        metadata=rec.metadata,
    )


@app.post("/v1/fulfillment/jobs/{job_id}/retry", response_model=JobResponse)
async def retry_job(job_id: str):
    rec = job_store.get(job_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Job not found")
    if rec.supplier_order_id:
        return JobResponse(job_id=rec.id, status="submitted", supplier_order_id=rec.supplier_order_id)
    result = await worker.run_job(rec.payload)
    if result.get("status") == "submitted":
        job_store.update(rec.id, status="submitted", supplier_order_id=result.get("supplier_order_id"))
    return JobResponse(job_id=rec.id, status=result.get("status", "failed"), supplier_order_id=result.get("supplier_order_id"))


@app.post("/v1/fulfillment/jobs/{job_id}/cancel")
async def cancel_job(job_id: str):
    rec = job_store.get(job_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Job not found")
    if rec.supplier_order_id:
        raise HTTPException(status_code=409, detail="Supplier order already submitted")
    job_store.update(rec.id, status="cancelled")
    return {"ok": True, "job_id": job_id}


@app.post("/v1/inventory/check")
async def inventory_check(req: InventoryCheckRequest):
    # Mock portal deterministic inventory for CI
    rows = [
        InventoryRow(sku=sku, stock_status="in_stock", quantity=25).model_dump() for sku in req.skus
    ]
    return {"rows": rows}


def main() -> None:
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=False)


if __name__ == "__main__":
    main()
