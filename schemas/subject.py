from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class TopicBase(BaseModel):
    name: str
    description: Optional[str] = None
    weight: float = 1.0

class TopicCreate(TopicBase):
    subject_id: int

class TopicRead(TopicBase):
    id: int
    subject_id: int

    class Config:
        from_attributes = True

class SubjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    grade_level: Optional[str] = None
    curriculum: Optional[str] = None

class SubjectCreate(SubjectBase):
    pass

class SubjectRead(SubjectBase):
    id: int
    created_at: datetime
    topics: List[TopicRead] = []

    class Config:
        from_attributes = True 