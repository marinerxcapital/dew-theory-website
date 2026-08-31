"""Dew Theory Skin Script RPA service configuration."""
from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
        populate_by_name=True,
    )

    host: str = "0.0.0.0"
    port: int = 8080
    hmac_secret: str = Field(
        default="",
        validation_alias=AliasChoices("HMAC_SECRET", "SKIN_SCRIPT_RPA_HMAC_SECRET"),
    )
    portal_base_url: str = Field(
        default="http://127.0.0.1:9090",
        validation_alias=AliasChoices("PORTAL_BASE_URL", "SKIN_SCRIPT_PORTAL_BASE_URL"),
    )
    login_url: str = Field(
        default="",
        validation_alias=AliasChoices("LOGIN_URL", "SKIN_SCRIPT_LOGIN_URL"),
    )
    username: str = Field(
        default="",
        validation_alias=AliasChoices("USERNAME", "SKIN_SCRIPT_USERNAME"),
    )
    password: str = Field(
        default="",
        validation_alias=AliasChoices("PASSWORD", "SKIN_SCRIPT_PASSWORD"),
    )
    expected_account_name: str = Field(
        default="",
        validation_alias=AliasChoices(
            "EXPECTED_ACCOUNT_NAME", "SKIN_SCRIPT_EXPECTED_ACCOUNT_NAME"
        ),
    )
    storage_state_path: str = Field(
        default="/tmp/skin-script-storage.json",
        validation_alias=AliasChoices("STORAGE_STATE_PATH", "SKIN_SCRIPT_STORAGE_STATE"),
    )
    dry_run: bool = Field(
        default=True,
        validation_alias=AliasChoices("DRY_RUN", "SKIN_SCRIPT_DRY_RUN"),
    )
    rpa_enabled: bool = Field(
        default=False,
        validation_alias=AliasChoices("RPA_ENABLED", "SKIN_SCRIPT_RPA_ENABLED"),
    )
    max_order_total_cents: int = Field(
        default=50000,
        validation_alias=AliasChoices(
            "MAX_ORDER_TOTAL_CENTS", "SKIN_SCRIPT_MAX_ORDER_TOTAL_CENTS"
        ),
    )
    max_line_quantity: int = Field(
        default=6,
        validation_alias=AliasChoices("MAX_LINE_QUANTITY", "SKIN_SCRIPT_MAX_LINE_QUANTITY"),
    )
    price_tolerance_percent: float = Field(
        default=5.0,
        validation_alias=AliasChoices(
            "PRICE_TOLERANCE_PERCENT", "SKIN_SCRIPT_PRICE_TOLERANCE_PERCENT"
        ),
    )
    job_lock_ttl_sec: int = 900
    navigation_timeout_ms: int = 30000
    mock_portal: bool = Field(
        default=True,
        validation_alias=AliasChoices("MOCK_PORTAL", "SKIN_SCRIPT_MOCK_PORTAL"),
    )
    portal_profile: str = Field(
        default="mock",
        validation_alias=AliasChoices("PORTAL_PROFILE", "SKIN_SCRIPT_PORTAL_PROFILE"),
    )
    selectors_config: str = "app/config/selectors.json"

    def resolved_portal_profile(self) -> str:
        if self.mock_portal:
            return "mock"
        if self.portal_profile == "woocommerce":
            return "woocommerce"
        if "skinscript.com" in self.portal_base_url:
            return "woocommerce"
        return self.portal_profile if self.portal_profile in ("mock", "woocommerce") else "mock"

    def resolved_login_url(self) -> str:
        if self.login_url:
            return self.login_url
        base = self.portal_base_url.rstrip("/")
        if self.resolved_portal_profile() == "woocommerce":
            return f"{base}/my-account/"
        return f"{base}/login"

    def resolved_selectors_path(self) -> Path:
        config_dir = Path(__file__).resolve().parent / "config"
        if self.resolved_portal_profile() == "woocommerce":
            return config_dir / "selectors-woocommerce.json"
        return config_dir / "selectors.json"


settings = Settings()
