"""Unit tests for allowlisted catalog URL policy — no purchase path."""
from app.jobs.catalog import catalog_url_allowed, parse_price_for_tests


def test_catalog_url_allows_wholesale_portal_only():
    assert catalog_url_allowed(
        "https://skinscript.com/product/green-tea-citrus-cleanser/",
        "https://skinscript.com",
    )
    assert catalog_url_allowed("http://127.0.0.1:9090/product/SS-A", "http://127.0.0.1:9090")
    assert not catalog_url_allowed("https://skinscriptrx.com/product/green-tea/", "https://skinscript.com")
    assert not catalog_url_allowed("https://www.sephora.com/product/x", "https://skinscript.com")
    assert not catalog_url_allowed("", "https://skinscript.com")


def test_price_parse_strips_currency():
    assert parse_price_for_tests("$18.00") == 18.0
