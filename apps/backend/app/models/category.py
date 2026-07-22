from typing import Optional
from sqlmodel import Field, SQLModel

class Category(SQLModel, table=True):
    """
    Represents an item category.
    """

    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True, index=True)
