"""Playwright E2E against mock Skin Script portal — no live supplier access."""
from __future__ import annotations

import pytest

from app.config import settings
from app.jobs.worker import FulfillmentWorker


def _base_payload(order_id: str = "ord_e2e_001", **overrides):
    payload = {
        "order_id": order_id,
        "idempotency_key": order_id,
        "dry_run": True,
        "customer": {"name": "Test Customer", "email": "test@example.com", "phone": "555-0100"},
        "shipping_address": {
            "line1": "123 Pearl St",
            "line2": "Apt 2",
            "city": "Austin",
            "state": "TX",
            "postal_code": "78701",
            "country": "US",
        },
        "lines": [
            {
                "skin_script_sku": "SS-GREEN_TEA_CITRUS_CLEANSER",
                "quantity": 1,
                "unit_wholesale": 16.0,
            }
        ],
    }
    payload.update(overrides)
    return payload


@pytest.fixture(autouse=True)
def enable_rpa(mock_portal_url, monkeypatch):
    monkeypatch.setattr(settings, "portal_base_url", mock_portal_url)
    monkeypatch.setattr(settings, "rpa_enabled", True)
    monkeypatch.setattr(settings, "dry_run", True)
    monkeypatch.setattr(settings, "username", "")
    monkeypatch.setattr(settings, "password", "")
    monkeypatch.setattr(settings, "expected_account_name", "")


@pytest.mark.asyncio
async def test_dry_run_happy_path():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload())
    assert result["status"] == "dry_run_ready"
    assert result.get("metadata", {}).get("total_cents", 0) > 0


@pytest.mark.asyncio
async def test_blocked_out_of_stock():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="oos"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_out_of_stock"


@pytest.mark.asyncio
async def test_blocked_price_drift():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="price_drift"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_price_drift"


@pytest.mark.asyncio
async def test_blocked_captcha():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="captcha"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_human_verification"


@pytest.mark.asyncio
async def test_blocked_mfa():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="mfa"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_human_verification"


@pytest.mark.asyncio
async def test_blocked_address_suggestion():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="address_suggestion"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_address_validation"


@pytest.mark.asyncio
async def test_blocked_payment_challenge():
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(_test_scenario="payment_challenge"))
    assert result["status"] == "blocked"
    assert result["error_code"] == "blocked_payment_authentication"


@pytest.mark.asyncio
async def test_kill_switch(monkeypatch):
    monkeypatch.setattr(settings, "rpa_enabled", False)
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload())
    assert result["status"] == "blocked"
    assert result["error_code"] == "rpa_disabled"


@pytest.mark.asyncio
async def test_production_submit_mock_portal(mock_portal_url, monkeypatch):
    """Non-dry-run against mock portal captures supplier order ID."""
    monkeypatch.setattr(settings, "dry_run", False)
    worker = FulfillmentWorker()
    result = await worker.run_job(_base_payload(order_id="ord_e2e_submit_001", dry_run=False))
    assert result["status"] == "submitted"
    assert result["supplier_order_id"]
    assert str(result["supplier_order_id"]).startswith("SSPO-MOCK-")
