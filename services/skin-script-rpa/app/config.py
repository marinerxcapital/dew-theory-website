"""Dew Theory Skin Script RPA service configuration."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    host: str = "0.0.0.0"
    port: int = 8080
    hmac_secret: str = ""
    portal_base_url: str = "http://127.0.0.1:9090"
    login_url: str = ""
    username: str = ""
    password: str = ""
    expected_account_name: str = ""
    storage_state_path: str = "/tmp/skin-script-storage.json"
    dry_run: bool = True
    rpa_enabled: bool = False
    max_order_total_cents: int = 50000
    max_line_quantity: int = 6
    price_tolerance_percent: float = 5.0
    job_lock_ttl_sec: int = 900
    navigation_timeout_ms: int = 30000
    mock_portal: bool = True
    selectors_config: str = "app/config/selectors.json"


settings = Settings()
