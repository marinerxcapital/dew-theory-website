"""Allowlisted wholesale-portal catalog reads. Never places an order."""
from __future__ import annotations

import re
from pathlib import Path
from typing import Any

from playwright.async_api import Page
from playwright.async_api import TimeoutError as PlaywrightTimeoutError
from playwright.async_api import async_playwright

from app.browser.pages import LoginPage, ProductPage, load_selectors
from app.config import settings
from app.jobs.portal_flows import _parse_price, _read_dom_sku, load_profile_selectors


WHOLESALE_PORTAL_PREFIX = "https://skinscript.com"


def catalog_url_allowed(url: str, portal_base: str) -> bool:
    """Only the configured wholesale portal (or skinscript.com after auth). No public retail scrape."""
    if not url:
        return False
    base = portal_base.rstrip("/")
    if url.startswith(f"{base}/") or url == base:
        return True
    if url.startswith(f"{WHOLESALE_PORTAL_PREFIX}/"):
        return True
    return False


def _stock_status(raw: str) -> str | None:
    text = (raw or "").strip().lower()
    if not text:
        return None
    if "out of stock" in text or "unavailable" in text:
        return "out_of_stock"
    if "in stock" in text or "available" in text:
        return "in_stock"
    return None


def _blocked(code: str, message: str) -> dict[str, Any]:
    return {"ok": False, "code": code, "error": message, "drafts": [], "errors": []}


async def _login_mock(page: Page, selectors: dict[str, Any]) -> dict[str, Any] | None:
    base = settings.portal_base_url.rstrip("/")
    await page.goto(f"{base}/login")
    login = LoginPage(page, selectors["login"])
    if settings.username and settings.password:
        await login.login(settings.username, settings.password)
    if await login.has_captcha():
        return _blocked("blocked_human_verification", "CAPTCHA detected")
    if await login.has_mfa():
        return _blocked("blocked_human_verification", "MFA required")
    return None


async def _login_woocommerce(page: Page, selectors: dict[str, Any]) -> dict[str, Any] | None:
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
        return _blocked("auth_failed", "Portal login did not establish session")

    if await page.locator(login_sel["captcha_marker"]).count() > 0:
        return _blocked("blocked_human_verification", "CAPTCHA detected")
    if await page.locator(login_sel["mfa_marker"]).count() > 0:
        return _blocked("blocked_human_verification", "MFA required")
    return None


async def _read_item(page: Page, item: dict[str, Any], selectors: dict[str, Any]) -> dict[str, Any]:
    sku = str(item.get("sku") or item.get("skin_script_sku") or "").strip()
    product_id = str(item.get("product_id") or item.get("id") or "").strip()
    base = settings.portal_base_url.rstrip("/")
    url = str(item.get("supplier_product_url") or "").strip()
    if not url:
        slug = product_id or sku
        url = f"{base}/product/{slug}/"

    if not catalog_url_allowed(url, settings.portal_base_url):
        return {
            "ok": False,
            "sku": sku,
            "id": product_id,
            "reason": "url_not_allowlisted",
            "error": "Catalog URL is not on the wholesale portal allowlist",
        }

    await page.goto(url, wait_until="domcontentloaded")
    prod_sel = selectors["product"]

    if settings.resolved_portal_profile() == "woocommerce":
        name = ""
        if await page.locator(prod_sel["name"]).count():
            name = (await page.locator(prod_sel["name"]).first.inner_text()).strip()
        live_sku = await _read_dom_sku(page, prod_sel) or sku
        price_raw = ""
        if await page.locator(prod_sel["price"]).count():
            price_raw = (await page.locator(prod_sel["price"]).first.inner_text()).strip()
        stock_raw = ""
        if await page.locator(prod_sel["stock"]).count():
            stock_raw = (await page.locator(prod_sel["stock"]).first.inner_text()).strip()
    else:
        product = ProductPage(page, prod_sel)
        identity = await product.read_identity()
        name = identity.get("name") or ""
        live_sku = identity.get("sku") or sku
        price_raw = identity.get("price") or ""
        stock_raw = identity.get("stock") or ""

    wholesale = _parse_price(price_raw)
    if wholesale <= 0:
        return {
            "ok": False,
            "sku": sku or live_sku,
            "id": product_id,
            "reason": "price_unreadable",
            "error": "Wholesale price could not be read from the portal page",
        }

    stock_status = _stock_status(stock_raw)
    if not stock_status:
        return {
            "ok": False,
            "sku": sku or live_sku,
            "id": product_id,
            "reason": "stock_unreadable",
            "error": "Availability could not be read from the portal page",
        }

    return {
        "ok": True,
        "draft": {
            "id": product_id or None,
            "name": name or product_id or live_sku,
            "skin_script_sku": sku or live_sku,
            "wholesale_price": wholesale,
            "stock_status": stock_status,
        },
    }


async def list_catalog_on_page(page: Page, items: list[dict[str, Any]]) -> dict[str, Any]:
    selectors = load_profile_selectors() if settings.resolved_portal_profile() == "woocommerce" else load_selectors()
    if settings.resolved_portal_profile() == "woocommerce":
        blocked = await _login_woocommerce(page, selectors)
    else:
        blocked = await _login_mock(page, selectors)
    if blocked:
        return blocked

    drafts: list[dict[str, Any]] = []
    errors: list[dict[str, Any]] = []
    for item in items:
        try:
            row = await _read_item(page, item, selectors)
        except PlaywrightTimeoutError:
            errors.append(
                {
                    "sku": item.get("sku") or item.get("skin_script_sku"),
                    "id": item.get("product_id"),
                    "reason": "navigation_timeout",
                }
            )
            continue
        if row.get("ok"):
            drafts.append(row["draft"])
        else:
            errors.append({k: v for k, v in row.items() if k != "ok"})

    return {"ok": True, "drafts": drafts, "errors": errors}


class CatalogWorker:
    """Read-only portal catalog. Never clicks add-to-cart or place-order."""

    async def list_catalog(self, items: list[dict[str, Any]]) -> dict[str, Any]:
        if not settings.rpa_enabled:
            return _blocked("rpa_disabled", "Kill switch active")
        if not items:
            return {"ok": True, "drafts": [], "errors": []}

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
                return await list_catalog_on_page(page, items)
            finally:
                await context.close()
                await browser.close()


def parse_price_for_tests(raw: str) -> float:
    digits = re.sub(r"[^0-9.]", "", raw)
    return float(digits or "0")
