from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Optional, Annotated

class A(BaseModel):
    price: Optional[Annotated[Decimal, Field(ge=0, decimal_places=2)]] = None

print("A loaded successfully with Optional[Annotated[Decimal, ...]]")
