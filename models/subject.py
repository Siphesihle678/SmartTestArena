from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Subject(Base):
    __tablename__ = "subjects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text)
    grade_level = Column(String(50))
    curriculum = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    topics = relationship("Topic", back_populates="subject")
    student_profiles = relationship("StudentProfile", back_populates="subject")
    analytics = relationship("Analytics", back_populates="subject") 