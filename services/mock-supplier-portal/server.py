#!/usr/bin/env python3
"""Mock Skin Script wholesale portal for CI and local RPA testing.

Uses only Python stdlib (http.server). Serves HTML pages with data-testid
attributes matching services/skin-script-rpa/app/config/selectors.json.
"""
from __future__ import annotations

import html
import os
import re
import uuid
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

PORT = int(os.environ.get("PORT", "9090"))

SCENARIOS = frozenset(
    {
        "captcha",
        "mfa",
        "oos",
        "price_drift",
        "address_suggestion",
        "payment_challenge",
        "ok",
    }
)

PRODUCTS: dict[str, dict[str, object]] = {
    "SS-GREEN_TEA_CITRUS_CLEANSER": {
        "name": "Green Tea Citrus Cleanser",
        "size": "6 oz",
        "price_cents": 1600,
    },
}

DEFAULT_PRODUCT = {"name": "Mock Product", "size": "1 oz", "price_cents": 1600}

# session_id -> {"cart": {sku: qty}, "scenario": str}
SESSIONS: dict[str, dict[str, object]] = {}

# Global order history for reconciliation fallback.
ORDERS: list[dict[str, object]] = []

COMMON_STYLE = """
body { font-family: system-ui, sans-serif; margin: 2rem; max-width: 48rem; }
[data-testid] { margin: 0.35rem 0; }
nav { margin-bottom: 1.5rem; }
nav a { margin-right: 0.75rem; }
form { margin: 1rem 0; }
input, button { display: block; margin: 0.5rem 0; padding: 0.4rem 0.6rem; }
.hidden { display: none; }
table { border-collapse: collapse; width: 100%; }
th, td { border: 1px solid #ccc; padding: 0.5rem; text-align: left; }
"""


def _esc(value: object) -> str:
    return html.escape(str(value), quote=True)


def _format_price(cents: int) -> str:
    return f"${cents / 100:.2f}"


def _parse_price(raw: str) -> int:
    digits = re.sub(r"[^0-9.]", "", raw)
    if not digits:
        return 0
    return int(round(float(digits) * 100))


def _product_for_sku(sku: str) -> dict[str, object]:
    return PRODUCTS.get(sku, {**DEFAULT_PRODUCT, "name": f"Product {sku}"})


def _scenario_from_request(handler: BaseHTTPRequestHandler) -> str:
    query = parse_qs(urlparse(handler.path).query)
    if "scenario" in query:
        candidate = query["scenario"][0]
        if candidate in SCENARIOS:
            return candidate
    cookie = handler.headers.get("Cookie", "")
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("mock_scenario="):
            value = part.split("=", 1)[1]
            if value in SCENARIOS:
                return value
    return "ok"


def _session_id_from_request(handler: BaseHTTPRequestHandler) -> str:
    cookie = handler.headers.get("Cookie", "")
    for part in cookie.split(";"):
        part = part.strip()
        if part.startswith("mock_session="):
            sid = part.split("=", 1)[1]
            if sid in SESSIONS:
                return sid
    sid = uuid.uuid4().hex
    SESSIONS[sid] = {"cart": {}, "scenario": "ok"}
    handler._set_cookie = getattr(handler, "_set_cookie", [])
    handler._set_cookie.append(f"mock_session={sid}; Path=/; HttpOnly; SameSite=Lax")
    return sid


def _session(handler: BaseHTTPRequestHandler) -> dict[str, object]:
    sid = _session_id_from_request(handler)
    return SESSIONS[sid]


def _scenario_qs(scenario: str) -> str:
    if scenario == "ok":
        return ""
    return f"?scenario={scenario}"


def _page(title: str, body: str, scenario: str) -> bytes:
    scenario_js = _esc(scenario)
    doc = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>{_esc(title)}</title>
  <style>{COMMON_STYLE}</style>
</head>
<body>
  <nav>
    <a href="/login{_scenario_qs(scenario)}">Login</a>
    <a href="/cart{_scenario_qs(scenario)}">Cart</a>
    <a href="/product/SS-GREEN_TEA_CITRUS_CLEANSER{_scenario_qs(scenario)}">Product</a>
    <a href="/checkout/shipping{_scenario_qs(scenario)}">Shipping</a>
    <a href="/checkout/payment{_scenario_qs(scenario)}">Payment</a>
    <a href="/checkout/review{_scenario_qs(scenario)}">Review</a>
    <a href="/orders{_scenario_qs(scenario)}">Orders</a>
  </nav>
  {body}
  <script>window.SCENARIO = "{scenario_js}";</script>
</body>
</html>"""
    return doc.encode("utf-8")


def _cart_total_cents(cart: dict[str, int]) -> int:
    total = 0
    for sku, qty in cart.items():
        product = _product_for_sku(sku)
        total += int(product["price_cents"]) * qty
    return total


def _render_login(scenario: str) -> bytes:
    captcha = (
        '<div data-testid="captcha-block">CAPTCHA verification required</div>'
        if scenario == "captcha"
        else ""
    )
    mfa = (
        '<div data-testid="mfa-block">MFA verification required</div>'
        if scenario == "mfa"
        else ""
    )
    body = f"""
  <h1>Wholesale Login</h1>
  <form method="POST" action="/login">
    <input data-testid="login-email" name="email" placeholder="email" />
    <input data-testid="login-password" name="password" type="password" placeholder="password" />
    <button data-testid="login-submit" type="submit">Sign in</button>
  </form>
  <p data-testid="account-name">Dew Theory Wholesale</p>
  {captcha}
  {mfa}
  <hr />
  <h2>Cart (pre-checkout)</h2>
  <form method="POST" action="/cart/clear">
    <button data-testid="cart-clear" type="submit">Clear Cart</button>
  </form>
  <p data-testid="cart-empty">Your cart is empty</p>
"""
    return _page("Login", body, scenario)


def _render_cart(cart: dict[str, int], scenario: str) -> bytes:
    lines: list[str] = []
    if cart:
        empty = ""
        for sku, qty in sorted(cart.items()):
            lines.append(
                f'<div><span data-testid="cart-line-sku">{_esc(sku)}</span> '
                f'× <span data-testid="cart-line-qty">{qty}</span></div>'
            )
    else:
        empty = '<p data-testid="cart-empty">Your cart is empty</p>'

    body = f"""
  <h1>Cart</h1>
  <form method="POST" action="/cart/clear">
    <button data-testid="cart-clear" type="submit">Clear Cart</button>
  </form>
  {empty}
  {"".join(lines)}
"""
    return _page("Cart", body, scenario)


def _render_product(sku: str, scenario: str) -> bytes:
    product = _product_for_sku(sku)
    price_cents = int(product["price_cents"])
    stock = "In Stock"
    if scenario == "oos":
        stock = "Out of Stock"
    if scenario == "price_drift":
        price_cents = 9900

    body = f"""
  <h1 data-testid="product-name">{_esc(product["name"])}</h1>
  <p data-testid="product-sku">{_esc(sku)}</p>
  <p data-testid="product-size">{_esc(product["size"])}</p>
  <p data-testid="product-price">{_format_price(price_cents)}</p>
  <p data-testid="product-stock">{_esc(stock)}</p>
  <form method="POST" action="/cart/add">
    <input type="hidden" name="sku" value="{_esc(sku)}" />
    <button data-testid="add-to-cart" type="submit">Add to Cart</button>
  </form>
"""
    return _page(f"Product — {sku}", body, scenario)


def _render_shipping(scenario: str) -> bytes:
    suggestion = (
        '<div data-testid="address-suggestion">Did you mean 123 Verified St?</div>'
        if scenario == "address_suggestion"
        else ""
    )
    body = f"""
  <h1>Shipping</h1>
  <form>
    <input data-testid="ship-name" name="name" placeholder="Name" />
    <input data-testid="ship-line1" name="line1" placeholder="Address line 1" />
    <input data-testid="ship-line2" name="line2" placeholder="Address line 2" />
    <input data-testid="ship-city" name="city" placeholder="City" />
    <input data-testid="ship-state" name="state" placeholder="State" />
    <input data-testid="ship-postal" name="postal" placeholder="Postal code" />
    <input data-testid="ship-phone" name="phone" placeholder="Phone" />
  </form>
  {suggestion}
"""
    return _page("Shipping", body, scenario)


def _render_payment(scenario: str) -> bytes:
    challenge = (
        '<div data-testid="payment-challenge">3-D Secure authentication required</div>'
        if scenario == "payment_challenge"
        else ""
    )
    body = f"""
  <h1>Payment</h1>
  <button type="button" data-testid="saved-payment">Use saved card •••• 4242</button>
  {challenge}
"""
    return _page("Payment", body, scenario)


def _render_review(cart: dict[str, int], scenario: str) -> bytes:
    total = _format_price(_cart_total_cents(cart))
    body = f"""
  <h1>Review Order</h1>
  <p data-testid="order-total">{total}</p>
  <form method="POST" action="/checkout/place">
    <button data-testid="place-order" type="submit">Place Order</button>
  </form>
"""
    return _page("Review", body, scenario)


def _render_confirmation(order_id: str, total_cents: int, scenario: str) -> bytes:
    body = f"""
  <h1>Order Confirmed</h1>
  <p data-testid="confirmation-order-id">{_esc(order_id)}</p>
  <p data-testid="confirmation-total">{_format_price(total_cents)}</p>
"""
    return _page("Confirmation", body, scenario)


def _render_orders(scenario: str) -> bytes:
    rows: list[str] = []
    for order in reversed(ORDERS):
        rows.append(
            "<tr data-testid=\"order-history-row\">"
            f'<td data-testid="history-order-id">{_esc(order["supplier_order_id"])}</td>'
            f"<td>{_format_price(int(order['total_cents']))}</td>"
            "</tr>"
        )
    table = (
        "<table><thead><tr><th>Order ID</th><th>Total</th></tr></thead>"
        f"<tbody>{''.join(rows) if rows else '<tr><td colspan=\"2\">No orders yet</td></tr>'}</tbody></table>"
    )
    body = f"""
  <h1>Order History</h1>
  {table}
"""
    return _page("Orders", body, scenario)


class MockPortalHandler(BaseHTTPRequestHandler):
    _set_cookie: list[str]

    def log_message(self, fmt: str, *args: object) -> None:
        print(f"[mock-portal] {self.address_string()} - {fmt % args}")

    def _send(
        self,
        status: HTTPStatus,
        body: bytes,
        content_type: str = "text/html; charset=utf-8",
        extra_headers: dict[str, str] | None = None,
    ) -> None:
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        for cookie in getattr(self, "_set_cookie", []):
            self.send_header("Set-Cookie", cookie)
        if extra_headers:
            for key, value in extra_headers.items():
                self.send_header(key, value)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _redirect(self, location: str, status: HTTPStatus = HTTPStatus.SEE_OTHER) -> None:
        self._send(status, b"", extra_headers={"Location": location})

    def _read_form(self) -> dict[str, str]:
        length = int(self.headers.get("Content-Length", "0"))
        raw = self.rfile.read(length).decode("utf-8") if length else ""
        parsed = parse_qs(raw)
        return {k: v[0] if v else "" for k, v in parsed.items()}

    def _apply_scenario_cookie(self, scenario: str) -> None:
        self._set_cookie = getattr(self, "_set_cookie", [])
        self._set_cookie.append(f"mock_scenario={scenario}; Path=/; SameSite=Lax")
        sess = _session(self)
        sess["scenario"] = scenario

    def _prepare(self) -> tuple[dict[str, object], str]:
        self._set_cookie = []
        scenario = _scenario_from_request(self)
        sess = _session(self)
        if scenario != "ok":
            self._apply_scenario_cookie(scenario)
        else:
            stored = str(sess.get("scenario", "ok"))
            scenario = stored if stored in SCENARIOS else "ok"
        return sess, scenario

    def do_GET(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        sess, scenario = self._prepare()
        cart: dict[str, int] = sess["cart"]  # type: ignore[assignment]

        if path == "/":
            body = _page(
                "Mock Skin Script Portal",
                "<h1>Mock Skin Script Wholesale Portal</h1>"
                "<p>Deterministic fixture for CI — not real supplier data.</p>",
                scenario,
            )
            self._send(HTTPStatus.OK, body)
            return

        if path == "/login":
            self._send(HTTPStatus.OK, _render_login(scenario))
            return

        if path == "/cart":
            self._send(HTTPStatus.OK, _render_cart(cart, scenario))
            return

        if path.startswith("/product/"):
            sku = path.split("/product/", 1)[1]
            if not sku:
                self._send(HTTPStatus.NOT_FOUND, b"SKU required")
                return
            self._send(HTTPStatus.OK, _render_product(sku, scenario))
            return

        if path == "/checkout/shipping":
            self._send(HTTPStatus.OK, _render_shipping(scenario))
            return

        if path == "/checkout/payment":
            self._send(HTTPStatus.OK, _render_payment(scenario))
            return

        if path == "/checkout/review":
            self._send(HTTPStatus.OK, _render_review(cart, scenario))
            return

        if path == "/confirmation":
            query = parse_qs(parsed.query)
            oid = query.get("oid", ["SSPO-MOCK-001"])[0]
            total = int(query.get("total", ["0"])[0])
            if total <= 0:
                total = _cart_total_cents(cart)
            self._send(HTTPStatus.OK, _render_confirmation(oid, total, scenario))
            return

        if path == "/orders":
            self._send(HTTPStatus.OK, _render_orders(scenario))
            return

        self._send(HTTPStatus.NOT_FOUND, b"Not found")

    def do_POST(self) -> None:  # noqa: N802
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/") or "/"
        sess, scenario = self._prepare()
        cart: dict[str, int] = sess["cart"]  # type: ignore[assignment]
        qs = _scenario_qs(scenario)

        if path == "/login":
            self._redirect(f"/cart{qs}")
            return

        if path == "/cart/clear":
            cart.clear()
            referer = self.headers.get("Referer", "")
            if "/login" in referer:
                self._redirect(f"/login{qs}")
            else:
                self._redirect(f"/cart{qs}")
            return

        if path == "/cart/add":
            form = self._read_form()
            sku = form.get("sku", "").strip()
            if sku:
                cart[sku] = cart.get(sku, 0) + 1
            self._redirect(f"/product/{sku}{qs}")
            return

        if path == "/checkout/place":
            total_cents = _cart_total_cents(cart)
            order_num = len(ORDERS) + 1
            supplier_order_id = f"SSPO-MOCK-{order_num:03d}"
            ORDERS.append(
                {
                    "supplier_order_id": supplier_order_id,
                    "total_cents": total_cents,
                    "lines": dict(cart),
                }
            )
            cart.clear()
            self._redirect(f"/confirmation?oid={supplier_order_id}&total={total_cents}{qs.replace('?', '&') if qs else ''}")
            return

        self._send(HTTPStatus.NOT_FOUND, b"Not found")


def main() -> None:
    server = HTTPServer(("0.0.0.0", PORT), MockPortalHandler)
    print(f"Mock Skin Script portal listening on http://127.0.0.1:{PORT}")
    print(f"Scenarios: {', '.join(sorted(SCENARIOS))}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down.")
        server.server_close()


if __name__ == "__main__":
    main()
