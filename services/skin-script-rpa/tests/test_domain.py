"""Unit tests for RPA domain models and job store."""
import pytest

from app.domain.models import CreateJobRequest, FulfillmentLine
from app.jobs.store import JobStore


def test_create_job_request_quantity_cap():
    from app.config import settings

    with pytest.raises(ValueError):
        FulfillmentLine(skin_script_sku="SS-X", quantity=settings.max_line_quantity + 1)


def test_job_store_idempotency():
    store = JobStore()
    payload = {
        "order_id": "ord_1",
        "idempotency_key": "key_1",
        "customer": {"name": "T", "email": "t@example.com"},
        "shipping_address": {"line1": "1 Main"},
        "lines": [{"skin_script_sku": "SS-A", "quantity": 1}],
    }
    j1 = store.create(payload)
    j2 = store.create(payload)
    assert j1.id == j2.id


def test_create_job_request_model():
    req = CreateJobRequest(
        order_id="ord_1",
        idempotency_key="k1",
        customer={"name": "A", "email": "a@example.com"},
        shipping_address={"line1": "1"},
        lines=[{"skin_script_sku": "SS-A", "quantity": 1}],
    )
    assert req.order_id == "ord_1"
