from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class StudentProfileBase(BaseModel):
    user_id: int
    subject_id: int
    performance_history: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None

class StudentProfileCreate(StudentProfileBase):
    pass

class StudentProfileUpdate(BaseModel):
    performance_history: Optional[List[Dict[str, Any]]] = None
    recommendations: Optional[List[Dict[str, Any]]] = None

class StudentProfileRead(StudentProfileBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 