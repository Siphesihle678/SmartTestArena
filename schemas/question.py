from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QuestionBase(BaseModel):
    question_text: str
    options: List[str]
    correct_answer: str
    difficulty: str = "medium"
    explanation: Optional[str] = None

class QuestionCreate(QuestionBase):
    topic_id: int

class QuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None
    difficulty: Optional[str] = None
    explanation: Optional[str] = None
    topic_id: Optional[int] = None

class QuestionRead(QuestionBase):
    id: int
    topic_id: int

    class Config:
        from_attributes = True 