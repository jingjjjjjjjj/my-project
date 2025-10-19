from pydantic import BaseModel
from typing import Optional

class Todo(BaseModel):
    name: str
    description: Optional[str] = None
    completed: bool = False
