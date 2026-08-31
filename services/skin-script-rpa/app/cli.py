"""CLI utilities — session bootstrap for authorized headed login."""
from __future__ import annotations

import argparse
import asyncio

from playwright.async_api import async_playwright

from app.config import settings


async def bootstrap_session() -> None:
    """Launch headed browser for legitimate MFA/login; save storage state locally."""
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context()
        page = await context.new_page()
        login_url = settings.login_url or f"{settings.portal_base_url.rstrip('/')}/login"
        print(f"Navigate and complete login (including MFA if required): {login_url}")
        await page.goto(login_url)
        input("Press Enter after successful login and account verification...")
        await context.storage_state(path=settings.storage_state_path)
        print(f"Storage state saved to {settings.storage_state_path} (treat as secret)")
        await browser.close()


def main() -> None:
    parser = argparse.ArgumentParser(prog="app.cli")
    sub = parser.add_subparsers(dest="cmd")
    sub.add_parser("bootstrap-session")
    args = parser.parse_args()
    if args.cmd == "bootstrap-session":
        asyncio.run(bootstrap_session())
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
