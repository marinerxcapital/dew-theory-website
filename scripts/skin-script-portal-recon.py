"""One-off Skin Script portal recon — run with env from .env.local. No secrets in output."""
from __future__ import annotations

import asyncio
import json
import os
import re
import sys
from pathlib import Path

from playwright.async_api import async_playwright


async def main() -> None:
    base = os.environ.get("SKIN_SCRIPT_PORTAL_BASE_URL", "https://skinscript.com").rstrip("/")
    login_url = os.environ.get("SKIN_SCRIPT_LOGIN_URL", f"{base}/my-account/")
    username = os.environ.get("SKIN_SCRIPT_USERNAME", "")
    password = os.environ.get("SKIN_SCRIPT_PASSWORD", "")
    if not username or not password:
        print("ERROR: set SKIN_SCRIPT_USERNAME and SKIN_SCRIPT_PASSWORD", file=sys.stderr)
        sys.exit(1)

    out: dict = {
        "portal_base_url": base,
        "login_url": login_url,
        "mfa_detected": False,
        "captcha_detected": False,
        "post_login_url": None,
        "account_indicators": [],
        "products": [],
        "cart_url": None,
        "checkout_urls": [],
        "login_selectors": {},
        "errors": [],
    }

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        page.set_default_timeout(45000)

        try:
            await page.goto(login_url, wait_until="domcontentloaded")
            await page.wait_for_timeout(2000)

            # Discover login form fields
            for sel in [
                "#username",
                "input[name='username']",
                "input[name='log']",
                "input[type='email']",
            ]:
                if await page.locator(sel).count():
                    out["login_selectors"]["username"] = sel
                    break
            for sel in [
                "#password",
                "input[name='password']",
                "input[name='pwd']",
                "input[type='password']",
            ]:
                if await page.locator(sel).count():
                    out["login_selectors"]["password"] = sel
                    break
            for sel in [
                "button.woocommerce-form-login__submit",
                ".woocommerce-form-login button[type='submit']",
                "form.login button[type='submit']",
                "button:has-text('Log in')",
                "input[name='login']",
            ]:
                if await page.locator(sel).count():
                    out["login_selectors"]["submit"] = sel
                    break

            # Accept cookies if banner present (common blocker)
            for cookie_sel in [
                "button:has-text('Accept All')",
                "button:has-text('Accept')",
                "#cookie_action_accept",
            ]:
                try:
                    btn = page.locator(cookie_sel).first
                    if await btn.count() and await btn.is_visible():
                        await btn.click(timeout=5000)
                        await page.wait_for_timeout(1000)
                        break
                except Exception:
                    pass

            if not out["login_selectors"].get("username"):
                out["errors"].append("username field not found")
            else:
                await page.fill(out["login_selectors"]["username"], username)
                await page.fill(out["login_selectors"]["password"], password)
                await page.click(out["login_selectors"]["submit"])
                await page.wait_for_timeout(4000)

            body_text = (await page.content()).lower()
            if "captcha" in body_text or "recaptcha" in body_text:
                out["captcha_detected"] = True
            if any(
                x in body_text
                for x in ["two-factor", "2fa", "verification code", "authenticator", "mfa"]
            ):
                out["mfa_detected"] = True

            out["post_login_url"] = page.url

            # Account name / dashboard hints
            for sel in [
                ".woocommerce-MyAccount-navigation",
                ".account-dashboard",
                "nav.woocommerce-MyAccount-navigation",
                ".my-account",
            ]:
                if await page.locator(sel).count():
                    out["account_indicators"].append(sel)

            # Shop / product discovery
            shop_urls = [
                f"{base}/shop/",
                f"{base}/shop-all/",
                f"{base}/product-category/professional/",
            ]
            product_links: set[str] = set()
            for shop_url in shop_urls:
                try:
                    await page.goto(shop_url, wait_until="domcontentloaded", timeout=30000)
                    await page.wait_for_timeout(2000)
                    links = await page.eval_on_selector_all(
                        "a[href*='/product/']",
                        "els => els.map(e => e.href)",
                    )
                    for link in links:
                        if "/product/" in link:
                            product_links.add(link.split("?")[0])
                except Exception as e:
                    out["errors"].append(f"shop {shop_url}: {type(e).__name__}")

            dew_products = [
                "green-tea-citrus-cleanser",
                "mandelic-brightening-serum",
                "ageless-skin-hydrating-serum",
                "ageless-skin-moisturizer",
                "botanical-bloom-hydrating-mask",
                "ageless-lip-treatment",
                "cucumber-hydration-toner",
                "sheer-protection-spf",
            ]
            for slug_hint in dew_products:
                for link in list(product_links):
                    if slug_hint.replace("-", "") in link.lower().replace("-", ""):
                        product_links.add(link)

            for url in sorted(product_links)[:20]:
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=30000)
                    await page.wait_for_timeout(1500)
                    html = await page.content()
                    sku_match = re.search(r"SKU:\s*([A-Za-z0-9\-]+)", html, re.I)
                    sku = sku_match.group(1) if sku_match else None
                    name = await page.title()
                    price_el = page.locator(".price .amount, .woocommerce-Price-amount, .price")
                    price = ""
                    if await price_el.count():
                        price = (await price_el.first.inner_text()).strip()
                    add_sel = None
                    for sel in [
                        "button.single_add_to_cart_button",
                        "button[name='add-to-cart']",
                        ".add_to_cart_button",
                    ]:
                        if await page.locator(sel).count():
                            add_sel = sel
                            break
                    out["products"].append(
                        {
                            "url": url,
                            "title": name,
                            "sku_from_page": sku,
                            "price_text": price[:80] if price else None,
                            "add_to_cart_selector": add_sel,
                        }
                    )
                except Exception as e:
                    out["errors"].append(f"product {url}: {type(e).__name__}")

            # Cart / checkout
            for path in ["/cart/", "/checkout/", "/my-account/orders/"]:
                try:
                    await page.goto(f"{base}{path}", wait_until="domcontentloaded", timeout=20000)
                    if path == "/cart/" and page.url:
                        out["cart_url"] = page.url
                    if "checkout" in page.url:
                        out["checkout_urls"].append(page.url)
                except Exception:
                    pass

            storage_path = os.environ.get(
                "SKIN_SCRIPT_STORAGE_STATE", "/tmp/skin-script-storage.json"
            )
            await context.storage_state(path=storage_path)
            out["storage_state_saved"] = storage_path

        except Exception as e:
            out["errors"].append(f"fatal: {type(e).__name__}: {str(e)[:200]}")
        finally:
            await context.close()
            await browser.close()

    # Redact any accidental credential echoes
    safe = json.dumps(out, indent=2)
    safe = safe.replace(username, "[REDACTED_USERNAME]")
    print(safe)


if __name__ == "__main__":
    asyncio.run(main())
