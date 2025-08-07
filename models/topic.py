from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(Integer, primary_key=True, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id"), nullable=False)
    name = Column(String(100), index=True, nullable=False)
    description = Column(Text)
    weight = Column(Float, default=1.0)
    
    # Relationships
    subject = relationship("Subject", back_populates="topics")
    questions = relationship("Question", back_populates="topic") 