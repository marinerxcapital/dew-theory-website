"""Fulfillment domain models."""
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class Customer(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""


class ShippingAddress(BaseModel):
    line1: str = ""
    line2: str = ""
    city: str = ""
    state: str = ""
    postal_code: str = ""
    country: str = "US"
    phone: str = ""


class FulfillmentLine(BaseModel):
    skin_script_sku: str
    product_id: Optional[str] = None
    name: Optional[str] = None
    quantity: int = Field(ge=1)
    variant: Optional[str] = None
    unit_wholesale: Optional[float] = None
    supplier_product_url: Optional[str] = None

    @field_validator("quantity")
    @classmethod
    def cap_quantity(cls, v: int) -> int:
        from app.config import settings

        if v > settings.max_line_quantity:
            raise ValueError(f"quantity exceeds cap {settings.max_line_quantity}")
        return v


class CreateJobRequest(BaseModel):
    order_id: str
    idempotency_key: str
    customer: Customer
    shipping_address: ShippingAddress
    lines: list[FulfillmentLine]
    dry_run: Optional[bool] = None


class JobResponse(BaseModel):
    job_id: str
    status: str
    supplier_order_id: Optional[str] = None
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    dry_run: bool = False
    metadata: dict[str, Any] = Field(default_factory=dict)


class InventoryCheckRequest(BaseModel):
    skus: list[str]


class InventoryRow(BaseModel):
    sku: str
    stock_status: str
    quantity: Optional[int] = None
