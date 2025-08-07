from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Analytics(Base):
    __tablename__ = "analytics"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    daily_submissions = Column(JSON)  # Store daily submission data as JSON
    topic_performance = Column(JSON)  # Store topic performance data as JSON
    trends = Column(JSON)  # Store trend data as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="analytics")
    subject = relationship("Subject", back_populates="analytics") 