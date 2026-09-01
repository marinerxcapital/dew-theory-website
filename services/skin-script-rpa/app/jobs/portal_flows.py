"""Portal-specific fulfillment flows (mock contract vs live WooCommerce)."""
from __future__ import annotations

import re
from typing import Any

from playwright.async_api import Page
from playwright.async_api import TimeoutError as PlaywrightTimeoutError

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


def load_profile_selectors() -> dict[str, Any]:
    path = settings.resolved_selectors_path()
    return load_selectors(path)


class MockPortalFlow:
    """Flow against services/mock-supplier-portal (data-testid contract)."""

    async def run(self, page: Page, payload: dict[str, Any], dry_run: bool) -> dict[str, Any]:
        selectors = load_profile_selectors()
        base = settings.portal_base_url.rstrip("/")
        login_url = f"{base}/login"
        test_scenario = payload.get("_test_scenario")
        if test_scenario:
            login_url = f"{login_url}?scenario={test_scenario}"
        await page.goto(login_url)

        login = LoginPage(page, selectors["login"])
        if settings.username and settings.password:
            await login.login(settings.username, settings.password)
        if await login.has_captcha():
            return _blocked("blocked_human_verification", "CAPTCHA detected")
        if await login.has_mfa():
            return _blocked("blocked_human_verification", "MFA required")

        if settings.expected_account_name:
            name = await login.account_name()
            if settings.expected_account_name.lower() not in name.lower():
                return _blocked("account_mismatch", f"Unexpected account: {name}")

        cart = CartPage(page, selectors["cart"])
        await page.goto(f"{base}/cart")
        await cart.clear()
        if not await cart.is_empty():
            return _blocked("blocked_supplier_policy", "Cart not empty after clear")

        total_cents = 0
        for line in payload.get("lines", []):
            url = line.get("supplier_product_url") or f"{base}/product/{line['skin_script_sku']}"
            if not url.startswith(base):
                return _blocked("blocked_supplier_policy", "URL not allowlisted")
            await page.goto(url)
            product = ProductPage(page, selectors["product"])
            identity = await product.read_identity()
            if identity["sku"] != line["skin_script_sku"]:
                return _blocked("blocked_supplier_mapping", f"SKU mismatch: {identity['sku']}")
            stock = identity["stock"].lower()
            if "out of stock" in stock or "unavailable" in stock:
                return _blocked("blocked_out_of_stock", identity["sku"])
            price = _parse_price(identity["price"])
            expected = line.get("unit_wholesale")
            if expected is not None and not _price_ok(price, expected):
                return _blocked("blocked_price_drift", identity["sku"])
            total_cents += int(price * 100) * int(line["quantity"])
            await product.add_to_cart(int(line["quantity"]))

        if total_cents > settings.max_order_total_cents:
            return _blocked("order_cap_exceeded", "Order total exceeds cap")

        ship = ShippingPage(page, selectors["shipping"])
        addr = payload.get("shipping_address", {})
        customer = payload.get("customer", {})
        await page.goto(f"{base}/checkout/shipping")
        await ship.fill_address(addr, customer.get("name", ""), customer.get("phone", ""))
        if await ship.has_address_suggestion():
            return _blocked("blocked_address_validation", "Address suggestion detected")

        pay = PaymentPage(page, selectors["payment"])
        await page.goto(f"{base}/checkout/payment")
        await pay.select_saved_payment()
        if await pay.has_payment_challenge():
            return _blocked("blocked_payment_authentication", "Payment challenge")

        review = ReviewPage(page, selectors["review"])
        await page.goto(f"{base}/checkout/review")
        live_total = await review.order_total_cents()
        if live_total > settings.max_order_total_cents:
            return _blocked("order_cap_exceeded", "Review total exceeds cap")

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
            return _blocked("submission_ambiguous", "Confirmation lost")

        confirm = ConfirmationPage(page, selectors["confirmation"])
        supplier_order_id = await confirm.supplier_order_id()
        return {"status": "submitted", "supplier_order_id": supplier_order_id}


class WooCommercePortalFlow:
    """Flow against skinscript.com WooCommerce professional portal."""

    async def run(self, page: Page, payload: dict[str, Any], dry_run: bool) -> dict[str, Any]:
        selectors = load_profile_selectors()
        base = settings.portal_base_url.rstrip("/")
        login_url = settings.resolved_login_url()

        await page.goto(login_url, wait_until="domcontentloaded")
        login_sel = selectors["login"]

        cookie_sel = login_sel.get("cookie_accept")
        if cookie_sel:
            btn = page.locator(cookie_sel).first
            if await btn.count() and await btn.is_visible():
                try:
                    await btn.click(timeout=5000)
                except PlaywrightTimeoutError:
                    pass

        logout_sel = login_sel.get("logout_link", "a:has-text('Logout')")
        logged_in = await page.locator(logout_sel).count() > 0

        if not logged_in and settings.username and settings.password:
            await page.fill(login_sel["username"], settings.username)
            await page.fill(login_sel["password"], settings.password)
            await page.click(login_sel["submit"])
            await page.wait_for_timeout(4000)
            logged_in = await page.locator(logout_sel).count() > 0

        if not logged_in:
            body = (await page.inner_text("body")).lower()
            if "logout" not in body and "hi, emily" not in body:
                err = page.locator(".woocommerce-error")
                if await err.count():
                    msg = (await err.first.inner_text()).strip()[:200]
                    if "incorrect" in msg.lower() or "invalid" in msg.lower():
                        return _blocked("auth_failed", "Portal login failed")
                return _blocked("auth_failed", "Portal login did not establish session")

        if await page.locator(login_sel["captcha_marker"]).count() > 0:
            return _blocked("blocked_human_verification", "CAPTCHA detected")
        if await page.locator(login_sel["mfa_marker"]).count() > 0:
            return _blocked("blocked_human_verification", "MFA required")

        expected_name = settings.expected_account_name or "Emily"
        body_text = (await page.inner_text("body")).lower()
        if expected_name.lower() not in body_text:
            return _blocked("account_mismatch", "Unexpected account context")

        await page.goto(f"{base}/cart/", wait_until="domcontentloaded")
        await _clear_woocommerce_cart(page, selectors["cart"])

        total_cents = 0
        expected_skus: list[str] = []
        prod_sel = selectors["product"]

        for line in payload.get("lines", []):
            url = line.get("supplier_product_url")
            if not url:
                slug = line.get("supplier_slug") or line.get("skin_script_sku")
                url = f"{base}/product/{slug}/"
            if not url.startswith("https://skinscript.com"):
                return _blocked("blocked_supplier_policy", "URL not allowlisted")

            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)

            var_sel = prod_sel.get("variation_select")
            if var_sel and await page.locator(var_sel).count():
                attr = await page.locator(var_sel).get_attribute("name")
                variant_hint = line.get("variant") or line.get("supplier_size")
                opts = await page.locator(var_sel).eval_on_selector_all(
                    "option[value]:not([value=''])",
                    "els => els.map(e => ({v:e.value,t:e.innerText.trim()}))",
                )
                chosen = opts[0] if opts else None
                if variant_hint and opts:
                    for o in opts:
                        if variant_hint.lower() in o["t"].lower() or variant_hint.lower() in o["v"].lower():
                            chosen = o
                            break
                if chosen and attr:
                    await page.select_option(f"select[name='{attr}']", chosen["v"])
                    await page.wait_for_timeout(1500)

            expected_sku = line.get("skin_script_sku", "")
            sku = await _read_dom_sku(page, prod_sel) or expected_sku or _slug_from_url(url)

            stock_loc = page.locator(prod_sel["stock"])
            if await stock_loc.count():
                stock = (await stock_loc.inner_text()).lower()
                if "out of stock" in stock or "unavailable" in stock:
                    return _blocked("blocked_out_of_stock", sku)

            qty = int(line.get("quantity", 1))
            if qty > settings.max_line_quantity:
                return _blocked("quantity_cap_exceeded", sku)

            qty_sel = prod_sel.get("quantity")
            if qty_sel and await page.locator(qty_sel).count():
                await page.fill(qty_sel, str(qty))

            add_sel = prod_sel["add_to_cart"]
            if not await page.locator(add_sel).count():
                return _blocked("blocked_supplier_policy", f"Add to cart unavailable for {sku}")
            await page.click(add_sel)
            await page.wait_for_timeout(4000)

            cart = await _cart_api(page)
            added = _find_cart_line(cart, expected_sku or sku, line.get("supplier_product_name"))
            if not added:
                return _blocked("blocked_supplier_policy", f"Cart missing line for {sku}")

            api_sku = added.get("sku", "")
            if expected_sku and api_sku != expected_sku:
                return _blocked("blocked_supplier_mapping", f"Cart SKU mismatch: {api_sku}")

            line_price_cents = int(added.get("prices", {}).get("price", 0))
            line_price = line_price_cents / 100
            expected = line.get("unit_wholesale")
            if line_price > 0 and expected is not None and not _price_ok(line_price, expected):
                return _blocked("blocked_price_drift", api_sku)

            total_cents += line_price_cents * qty
            expected_skus.append(api_sku)

        if total_cents > settings.max_order_total_cents:
            return _blocked("order_cap_exceeded", "Order total exceeds cap")

        customer = payload.get("customer", {})
        addr = payload.get("shipping_address", {})
        await page.goto(f"{base}/checkout/", wait_until="domcontentloaded")
        await page.wait_for_timeout(4000)

        ship_sel = selectors["shipping"]
        await _select_dropship_to_client(page, ship_sel)

        # Client dropship address fields may be readonly until portal UX exposes editable inputs.
        # Attempt fills only on visible editable controls; dry-run does not require successful fill.
        name_parts = (customer.get("name") or "").split(None, 1)
        first = name_parts[0] if name_parts else ""
        last = name_parts[1] if len(name_parts) > 1 else ""
        await _fill_editable(page, ship_sel["name"], first)
        if last:
            await _fill_editable(page, ship_sel.get("last_name", ""), last)
        if customer.get("email"):
            await _fill_editable(page, ship_sel.get("email", ""), customer["email"])
        await _fill_editable(page, ship_sel["line1"], addr.get("line1", ""))
        if addr.get("line2"):
            await _fill_editable(page, ship_sel["line2"], addr["line2"])
        await _fill_editable(page, ship_sel["city"], addr.get("city", ""))
        state_val = addr.get("state", "")
        for state_part in ship_sel["state"].split(","):
            state_loc = page.locator(state_part.strip()).first
            if (
                await state_loc.count()
                and await state_loc.is_visible()
                and await state_loc.is_editable()
            ):
                tag = await state_loc.evaluate("el => el.tagName.toLowerCase()")
                if tag == "select":
                    await state_loc.select_option(state_val)
                else:
                    await state_loc.fill(state_val)
                break
        await _fill_editable(page, ship_sel["postal"], addr.get("postal_code", ""))
        phone = customer.get("phone", "")
        if phone:
            await _fill_editable(page, ship_sel["phone"], phone)

        if await page.locator(ship_sel["suggestion"]).count() > 0:
            return _blocked("blocked_address_validation", "Address suggestion detected")

        pay_sel = selectors["payment"]
        pm = page.locator(pay_sel["saved_method"]).first
        if await pm.count():
            await pm.click()
        if await page.locator(pay_sel["challenge_marker"]).count() > 0:
            return _blocked("blocked_payment_authentication", "Payment challenge — no saved card on account")

        review_sel = selectors["review"]
        live_total = 0
        total_loc = page.locator(review_sel["total"]).first
        if await total_loc.count():
            raw = (await total_loc.inner_text()).strip()
            live_total = int(_parse_price(raw) * 100)
        if not live_total:
            cart = await _cart_api(page)
            live_total = int(cart.get("totals", {}).get("total_price", 0) or total_cents)

        if live_total > settings.max_order_total_cents:
            return _blocked("order_cap_exceeded", "Review total exceeds cap")

        if dry_run:
            place_visible = await page.locator(review_sel["place_order"]).count() > 0
            if not place_visible:
                return _blocked("blocked_supplier_policy", "Checkout review incomplete")
            return {
                "status": "dry_run_ready",
                "metadata": {
                    "total_cents": live_total or total_cents,
                    "portal": "woocommerce",
                    "skus": expected_skus,
                    "dropship_mode": "ship_to_client",
                },
            }

        place = page.locator(review_sel["place_order"]).first
        if not await place.count():
            return _blocked("blocked_supplier_policy", "Place order control missing")

        await place.click()
        try:
            await page.wait_for_url("**/order-received**", timeout=settings.navigation_timeout_ms)
        except PlaywrightTimeoutError:
            history = OrdersHistoryPage(page, selectors["orders_history"])
            await page.goto(f"{base}/my-account/orders/")
            found = await history.find_order_by_reference(payload["order_id"])
            if found:
                return {"status": "submitted", "supplier_order_id": found}
            return _blocked("submission_ambiguous", "Confirmation lost")

        confirm_sel = selectors["confirmation"]
        supplier_order_id = ""
        if await page.locator(confirm_sel["order_id"]).count():
            supplier_order_id = (await page.locator(confirm_sel["order_id"]).inner_text()).strip()
        return {"status": "submitted", "supplier_order_id": supplier_order_id}


async def _clear_woocommerce_cart(page: Page, cart_sel: dict[str, str]) -> None:
    await page.goto(f"{settings.portal_base_url.rstrip('/')}/cart/", wait_until="domcontentloaded")
    await page.wait_for_timeout(1500)
    cart = await _cart_api(page)
    for item in cart.get("items", []):
        key = item.get("key")
        if key:
            await page.evaluate(
                "async (k) => await fetch('/wp-json/wc/store/v1/cart/items/' + k, {method: 'DELETE'})",
                key,
            )
    await page.wait_for_timeout(800)
    for _ in range(20):
        remove = page.locator(cart_sel["clear"])
        if await remove.count() == 0:
            break
        await remove.first.click()
        await page.wait_for_timeout(600)


async def _cart_api(page: Page) -> dict[str, Any]:
    return await page.evaluate("async () => (await fetch('/wp-json/wc/store/v1/cart')).json()")


async def _read_dom_sku(page: Page, prod_sel: dict[str, str]) -> str:
    loc = page.locator(prod_sel["sku"]).first
    if not await loc.count():
        return ""
    attr = await loc.get_attribute("data-product_sku")
    if attr:
        return attr.strip()
    text = (await loc.inner_text()).strip()
    return _normalize_sku(text)


async def _fill_first(page: Page, selector: str, value: str) -> None:
    await _fill_editable(page, selector, value)


async def _fill_editable(page: Page, selector: str, value: str) -> None:
    if not selector or not value:
        return
    for part in selector.split(","):
        part = part.strip()
        loc = page.locator(part).first
        if await loc.count() and await loc.is_visible() and await loc.is_editable():
            await loc.fill(value)
            return


async def _select_dropship_to_client(page: Page, ship_sel: dict[str, str]) -> None:
    await page.evaluate(
        """
        () => {
          const sel = document.querySelector('#order-srx-srx_drop_ship_select');
          if (sel) {
            sel.value = 'Yes - Ship direct to client';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
          const btn = document.querySelector('[data-srx-value="Yes - Ship direct to client"]');
          if (btn) btn.click();
        }
        """
    )
    await page.wait_for_timeout(2000)


def _find_cart_line(cart: dict[str, Any], sku: str, name_hint: str | None) -> dict[str, Any] | None:
    items = cart.get("items", [])
    for item in items:
        if item.get("sku") == sku:
            return item
    if name_hint:
        hint = name_hint.lower()
        for item in items:
            if hint in (item.get("name") or "").lower():
                return item
    return items[-1] if items else None


def _blocked(code: str, message: str) -> dict[str, Any]:
    return {"status": "blocked", "error_code": code, "error_message": message}


def _parse_price(raw: str) -> float:
    digits = re.sub(r"[^0-9.]", "", raw)
    return float(digits or "0")


def _price_ok(live: float, expected: float) -> bool:
    if expected <= 0:
        return True
    drift = abs(live - expected) / expected * 100
    return drift <= settings.price_tolerance_percent


def _normalize_sku(raw: str) -> str:
    text = raw.strip()
    if ":" in text:
        text = text.split(":", 1)[1].strip()
    return text


def _slug_from_url(url: str) -> str:
    if "/product/" not in url:
        return ""
    return url.split("/product/")[1].strip("/").split("?")[0]


def get_flow() -> MockPortalFlow | WooCommercePortalFlow:
    if settings.resolved_portal_profile() == "woocommerce":
        return WooCommercePortalFlow()
    return MockPortalFlow()
