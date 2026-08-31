"""Centralized Playwright page objects — selectors from config contract."""
from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from playwright.async_api import Page


def load_selectors() -> dict[str, Any]:
    path = Path(__file__).resolve().parent.parent / "config" / "selectors.json"
    return json.loads(path.read_text())


class LoginPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def login(self, username: str, password: str) -> None:
        await self.page.fill(self.sel["username"], username)
        await self.page.fill(self.sel["password"], password)
        await self.page.click(self.sel["submit"])

    async def account_name(self) -> str:
        return (await self.page.locator(self.sel["account_name"]).inner_text()).strip()

    async def has_captcha(self) -> bool:
        return await self.page.locator(self.sel["captcha_marker"]).count() > 0

    async def has_mfa(self) -> bool:
        return await self.page.locator(self.sel["mfa_marker"]).count() > 0


class ProductPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def read_identity(self) -> dict[str, str]:
        return {
            "sku": (await self.page.locator(self.sel["sku"]).inner_text()).strip(),
            "name": (await self.page.locator(self.sel["name"]).inner_text()).strip(),
            "size": (await self.page.locator(self.sel["size"]).inner_text()).strip(),
            "price": (await self.page.locator(self.sel["price"]).inner_text()).strip(),
            "stock": (await self.page.locator(self.sel["stock"]).inner_text()).strip(),
        }

    async def add_to_cart(self, qty: int) -> None:
        for _ in range(max(1, qty)):
            await self.page.click(self.sel["add_to_cart"])


class CartPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def clear(self) -> None:
        if await self.page.locator(self.sel["clear"]).count():
            await self.page.click(self.sel["clear"])

    async def is_empty(self) -> bool:
        return await self.page.locator(self.sel["empty_marker"]).count() > 0

    async def line_skus(self) -> list[str]:
        loc = self.page.locator(self.sel["line_sku"])
        count = await loc.count()
        return [(await loc.nth(i).inner_text()).strip() for i in range(count)]


class ShippingPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def fill_address(self, addr: dict[str, str], name: str, phone: str) -> None:
        await self.page.fill(self.sel["name"], name)
        await self.page.fill(self.sel["line1"], addr.get("line1", ""))
        if addr.get("line2"):
            await self.page.fill(self.sel["line2"], addr["line2"])
        await self.page.fill(self.sel["city"], addr.get("city", ""))
        await self.page.fill(self.sel["state"], addr.get("state", ""))
        await self.page.fill(self.sel["postal"], addr.get("postal_code", ""))
        if phone:
            await self.page.fill(self.sel["phone"], phone)

    async def has_address_suggestion(self) -> bool:
        return await self.page.locator(self.sel["suggestion"]).count() > 0


class PaymentPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def select_saved_payment(self) -> None:
        await self.page.click(self.sel["saved_method"])

    async def has_payment_challenge(self) -> bool:
        return await self.page.locator(self.sel["challenge_marker"]).count() > 0


class ReviewPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def order_total_cents(self) -> int:
        raw = (await self.page.locator(self.sel["total"]).inner_text()).strip()
        digits = "".join(ch for ch in raw if ch.isdigit() or ch == ".")
        return int(float(digits or "0") * 100)

    async def place_order(self) -> None:
        await self.page.click(self.sel["place_order"])


class ConfirmationPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def supplier_order_id(self) -> str:
        return (await self.page.locator(self.sel["order_id"]).inner_text()).strip()


class OrdersHistoryPage:
    def __init__(self, page: Page, sel: dict[str, str]) -> None:
        self.page = page
        self.sel = sel

    async def find_order_by_reference(self, reference: str) -> str | None:
        rows = self.page.locator(self.sel["row"])
        count = await rows.count()
        for i in range(count):
            oid = (await rows.nth(i).locator(self.sel["order_id"]).inner_text()).strip()
            if reference in oid:
                return oid
        return None
