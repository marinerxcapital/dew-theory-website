"""In-memory job store for RPA service (durable state lives in Dew Theory commerce DB)."""
from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Any, Optional


@dataclass
class JobRecord:
    id: str
    order_id: str
    idempotency_key: str
    status: str
    payload: dict[str, Any]
    supplier_order_id: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    attempt_count: int = 0
    locked_by: Optional[str] = None
    locked_at: Optional[float] = None
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    metadata: dict[str, Any] = field(default_factory=dict)


class JobStore:
    def __init__(self) -> None:
        self._jobs: dict[str, JobRecord] = {}
        self._by_idempotency: dict[str, str] = {}
        self._by_order: dict[str, str] = {}

    def create(self, payload: dict[str, Any]) -> JobRecord:
        key = payload["idempotency_key"]
        if key in self._by_idempotency:
            return self._jobs[self._by_idempotency[key]]

        job_id = f"rpa_{uuid.uuid4().hex[:12]}"
        rec = JobRecord(
            id=job_id,
            order_id=payload["order_id"],
            idempotency_key=key,
            status="queued",
            payload=payload,
        )
        self._jobs[job_id] = rec
        self._by_idempotency[key] = job_id
        self._by_order[payload["order_id"]] = job_id
        return rec

    def get(self, job_id: str) -> Optional[JobRecord]:
        return self._jobs.get(job_id)

    def get_by_order(self, order_id: str) -> Optional[JobRecord]:
        jid = self._by_order.get(order_id)
        return self._jobs.get(jid) if jid else None

    def update(self, job_id: str, **fields: Any) -> Optional[JobRecord]:
        rec = self._jobs.get(job_id)
        if not rec:
            return None
        for k, v in fields.items():
            setattr(rec, k, v)
        rec.updated_at = time.time()
        return rec


job_store = JobStore()
