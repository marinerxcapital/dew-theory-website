"""Probe Skin Script checkout payment + address field state — no secrets in output."""
import asyncio
import json
import os
from playwright.async_api import async_playwright


async def main():
    base = os.environ.get("SKIN_SCRIPT_PORTAL_BASE_URL", "https://skinscript.com").rstrip("/")
    login_url = os.environ.get("SKIN_SCRIPT_LOGIN_URL", f"{base}/my-account/")
    username = os.environ["SKIN_SCRIPT_USERNAME"]
    password = os.environ["SKIN_SCRIPT_PASSWORD"]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()

        await page.goto(login_url)
        await page.fill("#username", username)
        await page.fill("#password", password)
        await page.click("button.woocommerce-form-login__submit")
        await page.wait_for_timeout(4000)

        await page.goto(f"{base}/product/green-tea-citrus-cleanser/")
        await page.wait_for_timeout(2000)
        await page.click("button.single_add_to_cart_button")
        await page.wait_for_timeout(3000)

        await page.goto(f"{base}/checkout/")
        await page.wait_for_timeout(5000)

        # Dropship
        await page.evaluate(
            """
            () => {
              const sel = document.querySelector('#order-srx-srx_drop_ship_select');
              if (sel) {
                sel.value = 'Yes - Ship direct to client';
                sel.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
            """
        )
        await page.wait_for_timeout(3000)

        fields = [
            "#shipping-first_name", "#shipping-last_name", "#shipping-address_1",
            "#shipping-city", "#billing-first_name", "#billing-address_1",
        ]
        field_state = {}
        for sel in fields:
            loc = page.locator(sel).first
            if await loc.count():
                field_state[sel] = {
                    "visible": await loc.is_visible(),
                    "editable": await loc.is_editable(),
                    "readonly": await loc.get_attribute("readonly"),
                }

        payment_methods = page.locator(
            "#radio-control-wc-payment-method-options-nmi, input[name='payment_method']"
        )
        pm_count = await payment_methods.count()
        saved_pm = page.locator("input[name='payment_method']:checked, .payment_method")

        info = {
            "checkout_url": page.url,
            "payment_method_controls": pm_count,
            "saved_payment_labels": [],
            "address_fields": field_state,
            "place_order_visible": await page.locator("button:has-text('Place Order')").count() > 0,
            "body_snippet": (await page.inner_text("body"))[:500],
        }
        for i in range(min(pm_count, 5)):
            el = payment_methods.nth(i)
            info["saved_payment_labels"].append((await el.inner_text()).strip()[:80])

        print(json.dumps(info, indent=2))
        await browser.close()


asyncio.run(main())
