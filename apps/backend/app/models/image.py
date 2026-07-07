from sqlmodel import SQLModel, Field

class Image(SQLModel, table=True):
    __tablename__ = "images"
    id: int = Field(default=None, primary_key=True)
    data: bytes
    content_type: str
