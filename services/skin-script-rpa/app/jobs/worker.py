"""Per-job browser fulfillment orchestration."""
from __future__ import annotations

import re
from typing import Any

from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

from app.browser.pages import (
    CartPage,
    ConfirmationPage,
    LoginPage,
    OrdersHistoryPage,
    PaymentPage,
    ProductPage,
    ReviewPage,
    ShippingPage,
    load_selectors,
)
from app.config import settings


class FulfillmentWorker:
    async def run_job(self, payload: dict[str, Any]) -> dict[str, Any]:
        if not settings.rpa_enabled:
            return {"status": "blocked", "error_code": "rpa_disabled", "error_message": "Kill switch active"}

        selectors = load_selectors()
        dry_run = payload.get("dry_run", settings.dry_run)

        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context()
            page = await context.new_page()
            page.set_default_timeout(settings.navigation_timeout_ms)

            try:
                base = settings.portal_base_url.rstrip("/")
                await page.goto(f"{base}/login")

                login = LoginPage(page, selectors["login"])
                if settings.username and settings.password:
                    await login.login(settings.username, settings.password)
                if await login.has_captcha():
                    return self._blocked("blocked_human_verification", "CAPTCHA detected")
                if await login.has_mfa():
                    return self._blocked("blocked_human_verification", "MFA required")

                if settings.expected_account_name:
                    name = await login.account_name()
                    if settings.expected_account_name.lower() not in name.lower():
                        return self._blocked("account_mismatch", f"Unexpected account: {name}")

                cart = CartPage(page, selectors["cart"])
                await cart.clear()
                if not await cart.is_empty():
                    return self._blocked("blocked_supplier_policy", "Cart not empty after clear")

                total_cents = 0
                for line in payload.get("lines", []):
                    url = line.get("supplier_product_url") or f"{base}/product/{line['skin_script_sku']}"
                    if not url.startswith(base):
                        return self._blocked("blocked_supplier_policy", "URL not allowlisted")
                    await page.goto(url)
                    product = ProductPage(page, selectors["product"])
                    identity = await product.read_identity()
                    if identity["sku"] != line["skin_script_sku"]:
                        return self._blocked("blocked_supplier_mapping", f"SKU mismatch: {identity['sku']}")
                    stock = identity["stock"].lower()
                    if "out of stock" in stock or "unavailable" in stock:
                        return self._blocked("blocked_out_of_stock", identity["sku"])
                    price = self._parse_price(identity["price"])
                    expected = line.get("unit_wholesale")
                    if expected is not None and not self._price_ok(price, expected):
                        return self._blocked("blocked_price_drift", identity["sku"])
                    total_cents += int(price * 100) * int(line["quantity"])
                    await product.add_to_cart(int(line["quantity"]))

                if total_cents > settings.max_order_total_cents:
                    return self._blocked("order_cap_exceeded", "Order total exceeds cap")

                ship = ShippingPage(page, selectors["shipping"])
                addr = payload.get("shipping_address", {})
                customer = payload.get("customer", {})
                await page.goto(f"{base}/checkout/shipping")
                await ship.fill_address(addr, customer.get("name", ""), customer.get("phone", ""))
                if await ship.has_address_suggestion():
                    return self._blocked("blocked_address_validation", "Address suggestion detected")

                pay = PaymentPage(page, selectors["payment"])
                await page.goto(f"{base}/checkout/payment")
                await pay.select_saved_payment()
                if await pay.has_payment_challenge():
                    return self._blocked("blocked_payment_authentication", "Payment challenge")

                review = ReviewPage(page, selectors["review"])
                await page.goto(f"{base}/checkout/review")
                live_total = await review.order_total_cents()
                if live_total > settings.max_order_total_cents:
                    return self._blocked("order_cap_exceeded", "Review total exceeds cap")

                if dry_run:
                    return {"status": "dry_run_ready", "metadata": {"total_cents": live_total}}

                await review.place_order()
                try:
                    await page.wait_for_url("**/confirmation**", timeout=settings.navigation_timeout_ms)
                except PlaywrightTimeoutError:
                    history = OrdersHistoryPage(page, selectors["orders_history"])
                    await page.goto(f"{base}/orders")
                    found = await history.find_order_by_reference(payload["order_id"])
                    if found:
                        return {"status": "submitted", "supplier_order_id": found}
                    return self._blocked("submission_ambiguous", "Confirmation lost")

                confirm = ConfirmationPage(page, selectors["confirmation"])
                supplier_order_id = await confirm.supplier_order_id()
                return {"status": "submitted", "supplier_order_id": supplier_order_id}
            finally:
                await context.close()
                await browser.close()

    def _blocked(self, code: str, message: str) -> dict[str, Any]:
        return {"status": "blocked", "error_code": code, "error_message": message}

    def _parse_price(self, raw: str) -> float:
        digits = re.sub(r"[^0-9.]", "", raw)
        return float(digits or "0")

    def _price_ok(self, live: float, expected: float) -> bool:
        if expected <= 0:
            return True
        drift = abs(live - expected) / expected * 100
        return drift <= settings.price_tolerance_percent
