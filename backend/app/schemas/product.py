from pydantic import ConfigDict, BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional, Annotated
from datetime import datetime


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    price: Decimal = Field(..., ge=0, decimal_places=2)
    stock_quantity: int = Field(..., ge=0)

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v):
        return v.upper().strip()

    @field_validator("name")
    @classmethod
    def name_strip(cls, v):
        return v.strip()


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[Annotated[Decimal, Field(ge=0, decimal_places=2)]] = None
    stock_quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
