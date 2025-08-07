from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import Base

class Question(Base):
    __tablename__ = "questions"
    
    id = Column(Integer, primary_key=True, index=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON)  # Store as JSON array
    correct_answer = Column(String(255), nullable=False)
    difficulty = Column(String(20), default="medium")  # easy, medium, hard
    explanation = Column(Text)
    
    # Relationships
    topic = relationship("Topic", back_populates="questions") 