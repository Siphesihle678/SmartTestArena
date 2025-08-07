from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from models import Question, Topic
from schemas.question import QuestionCreate, QuestionRead, QuestionUpdate
from core.auth import get_current_user

router = APIRouter()

@router.get("/", response_model=List[QuestionRead])
def get_questions(db: Session = Depends(get_db)):
    """Get all questions"""
    return db.query(Question).all()

@router.get("/topic/{topic_id}", response_model=List[QuestionRead])
def get_questions_by_topic(topic_id: int, db: Session = Depends(get_db)):
    """Get all questions for a specific topic"""
    questions = db.query(Question).filter(Question.topic_id == topic_id).all()
    return questions

@router.post("/", response_model=QuestionRead)
def create_question(question: QuestionCreate, db: Session = Depends(get_db)):
    """Create a new question"""
    # Verify topic exists
    topic = db.query(Topic).filter(Topic.id == question.topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.get("/{question_id}", response_model=QuestionRead)
def get_question(question_id: int, db: Session = Depends(get_db)):
    """Get a specific question by ID"""
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    return question

@router.put("/{question_id}", response_model=QuestionRead)
def update_question(question_id: int, question: QuestionUpdate, db: Session = Depends(get_db)):
    """Update a question"""
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    for key, value in question.dict(exclude_unset=True).items():
        setattr(db_question, key, value)
    
    db.commit()
    db.refresh(db_question)
    return db_question

@router.delete("/{question_id}")
def delete_question(question_id: int, db: Session = Depends(get_db)):
    """Delete a question"""
    db_question = db.query(Question).filter(Question.id == question_id).first()
    if not db_question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    db.delete(db_question)
    db.commit()
    return {"message": "Question deleted successfully"} 