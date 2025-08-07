from pydantic import BaseModel
from typing import Dict, Any, Optional
from datetime import datetime

class AnalyticsBase(BaseModel):
    user_id: int
    subject_id: int
    daily_submissions: Optional[Dict[str, Any]] = None
    topic_performance: Optional[Dict[str, Any]] = None
    trends: Optional[Dict[str, Any]] = None

class AnalyticsCreate(AnalyticsBase):
    pass

class AnalyticsUpdate(BaseModel):
    user_id: int
    subject_id: int
    daily_submissions: Optional[Dict[str, Any]] = None
    topic_performance: Optional[Dict[str, Any]] = None
    trends: Optional[Dict[str, Any]] = None

class AnalyticsRead(AnalyticsBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True 