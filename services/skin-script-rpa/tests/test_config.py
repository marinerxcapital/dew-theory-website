"""Config and portal profile resolution tests."""
from pathlib import Path

from app.config import Settings


def test_settings_accepts_skin_script_env_aliases(monkeypatch):
    monkeypatch.setenv("SKIN_SCRIPT_PORTAL_BASE_URL", "https://skinscript.com")
    monkeypatch.setenv("SKIN_SCRIPT_USERNAME", "user@example.com")
    monkeypatch.setenv("SKIN_SCRIPT_DRY_RUN", "true")
    monkeypatch.setenv("SKIN_SCRIPT_MOCK_PORTAL", "false")
    s = Settings()
    assert s.portal_base_url == "https://skinscript.com"
    assert s.username == "user@example.com"
    assert s.dry_run is True
    assert s.resolved_portal_profile() == "woocommerce"


def test_mock_portal_profile_when_mock_portal_true(monkeypatch):
    monkeypatch.setenv("SKIN_SCRIPT_PORTAL_BASE_URL", "https://skinscript.com")
    monkeypatch.setenv("SKIN_SCRIPT_MOCK_PORTAL", "true")
    s = Settings()
    assert s.resolved_portal_profile() == "mock"


def test_woocommerce_selectors_file_exists():
    path = Path(__file__).resolve().parents[1] / "app" / "config" / "selectors-woocommerce.json"
    assert path.is_file()
