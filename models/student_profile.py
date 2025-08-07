from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class StudentProfile(Base):
    __tablename__ = "student_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    performance_history = Column(JSON)  # Store performance data as JSON
    recommendations = Column(JSON)  # Store recommendations as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="student_profiles")
    subject = relationship("Subject", back_populates="student_profiles") 