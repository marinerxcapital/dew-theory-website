"""Per-job browser fulfillment orchestration."""
from __future__ import annotations

from pathlib import Path
from typing import Any

from playwright.async_api import async_playwright

from app.config import settings
from app.jobs.portal_flows import get_flow


class FulfillmentWorker:
    async def run_job(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not settings.rpa_enabled:
            return {
                "status": "blocked",
                "error_code": "rpa_disabled",
                "error_message": "Kill switch active",
            }

        dry_run = payload.get("dry_run", settings.dry_run)
        flow = get_flow()

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            storage_path = Path(settings.storage_state_path)
            context_kwargs: dict[str, Any] = {}
            if storage_path.is_file():
                context_kwargs["storage_state"] = str(storage_path)
            context = await browser.new_context(**context_kwargs)
            page = await context.new_page()
            page.set_default_timeout(settings.navigation_timeout_ms)

            try:
                return await flow.run(page, payload, dry_run)
            finally:
                await context.close()
                await browser.close()
