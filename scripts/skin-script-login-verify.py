"""Verify Skin Script login state — no secrets in output."""
import asyncio
import json
import os
from playwright.async_api import async_playwright


async def main():
    base = os.environ.get("SKIN_SCRIPT_PORTAL_BASE_URL", "https://skinscript.com").rstrip("/")
    login_url = os.environ.get("SKIN_SCRIPT_LOGIN_URL", f"{base}/my-account/")
    username = os.environ["SKIN_SCRIPT_USERNAME"]
    password = os.environ["SKIN_SCRIPT_PASSWORD"]
    storage = "/tmp/skin-script-storage.json"

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto(login_url)
        for sel in ["button:has-text('Accept All')"]:
            try:
                if await page.locator(sel).count():
                    await page.locator(sel).first.click(timeout=3000)
            except Exception:
                pass
        await page.fill("#username", username)
        await page.fill("#password", password)
        await page.click("button.woocommerce-form-login__submit")
        await page.wait_for_timeout(5000)

        info = {
            "url_after_login": page.url,
            "has_logout": await page.locator("a:has-text('Logout')").count() > 0,
            "has_login_form": await page.locator(".woocommerce-form-login").count() > 0,
            "nav_links": [],
            "error_notices": [],
        }
        nav = page.locator(".woocommerce-MyAccount-navigation a")
        for i in range(await nav.count()):
            info["nav_links"].append((await nav.nth(i).inner_text()).strip())

        for sel in [".woocommerce-error", ".woocommerce-message", ".woocommerce-info"]:
            loc = page.locator(sel)
            for i in range(await loc.count()):
                info["error_notices"].append((await loc.nth(i).inner_text()).strip()[:200])

        # Test product price visibility when logged in
        await page.goto(f"{base}/product/green-tea-citrus-cleanser/")
        await page.wait_for_timeout(2000)
        price = page.locator(".price .amount, .woocommerce-Price-amount")
        info["green_tea_price_visible"] = await price.count() > 0
        if await price.count():
            info["green_tea_price"] = (await price.first.inner_text()).strip()
        sku_el = page.locator(".sku")
        if await sku_el.count():
            info["green_tea_sku"] = (await sku_el.inner_text()).strip()

        add_btn = page.locator("button.single_add_to_cart_button")
        info["green_tea_add_to_cart"] = await add_btn.count() > 0

        await context.storage_state(path=storage)
        print(json.dumps(info, indent=2))


asyncio.run(main())
