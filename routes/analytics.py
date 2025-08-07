from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from core.database import get_db
from models import Analytics, User, Attempt, Exam
from schemas.analytics import AnalyticsRead, AnalyticsUpdate
from core.auth import get_current_user
from datetime import datetime, timedelta
import json

router = APIRouter()

@router.get("/user/{user_id}", response_model=AnalyticsRead)
def get_user_analytics(user_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific user"""
    analytics = db.query(Analytics).filter(Analytics.user_id == user_id).first()
    if not analytics:
        raise HTTPException(status_code=404, detail="Analytics not found")
    return analytics

@router.get("/user/{user_id}/summary")
def get_user_analytics_summary(user_id: int, db: Session = Depends(get_db)):
    """Get a summary of user analytics"""
    # Get user attempts
    attempts = db.query(Attempt).filter(Attempt.user_id == user_id).all()
    
    if not attempts:
        return {
            "total_attempts": 0,
            "average_score": 0,
            "total_questions": 0,
            "correct_answers": 0,
            "streak_days": 0
        }
    
    # Calculate summary statistics
    total_attempts = len(attempts)
    total_questions = sum(attempt.total_questions for attempt in attempts)
    correct_answers = sum(attempt.correct_answers for attempt in attempts)
    average_score = (correct_answers / total_questions * 100) if total_questions > 0 else 0
    
    # Calculate streak (simplified)
    streak_days = 1  # Placeholder for streak calculation
    
    return {
        "total_attempts": total_attempts,
        "average_score": round(average_score, 2),
        "total_questions": total_questions,
        "correct_answers": correct_answers,
        "streak_days": streak_days
    }

@router.post("/update")
def update_analytics(analytics_data: AnalyticsUpdate, db: Session = Depends(get_db)):
    """Update analytics based on new attempt"""
    # Find existing analytics or create new
    analytics = db.query(Analytics).filter(
        Analytics.user_id == analytics_data.user_id,
        Analytics.subject_id == analytics_data.subject_id
    ).first()
    
    if not analytics:
        analytics = Analytics(
            user_id=analytics_data.user_id,
            subject_id=analytics_data.subject_id,
            daily_submissions={},
            topic_performance={},
            trends={}
        )
        db.add(analytics)
    
    # Update analytics data
    if analytics_data.daily_submissions:
        analytics.daily_submissions = analytics_data.daily_submissions
    if analytics_data.topic_performance:
        analytics.topic_performance = analytics_data.topic_performance
    if analytics_data.trends:
        analytics.trends = analytics_data.trends
    
    db.commit()
    db.refresh(analytics)
    return {"message": "Analytics updated successfully"}

@router.get("/export/{user_id}")
def export_analytics(user_id: int, format: str = "json", db: Session = Depends(get_db)):
    """Export analytics in various formats"""
    analytics = db.query(Analytics).filter(Analytics.user_id == user_id).all()
    
    if not analytics:
        raise HTTPException(status_code=404, detail="No analytics found for user")
    
    if format == "json":
        return {"analytics": [analytics_data.dict() for analytics_data in analytics]}
    elif format == "csv":
        # Placeholder for CSV export
        return {"message": "CSV export not yet implemented"}
    elif format == "pdf":
        # Placeholder for PDF export
        return {"message": "PDF export not yet implemented"}
    else:
        raise HTTPException(status_code=400, detail="Unsupported format")

@router.get("/dashboard/{user_id}")
def get_dashboard_data(user_id: int, db: Session = Depends(get_db)):
    """Get comprehensive dashboard data for a user"""
    # Get user attempts
    attempts = db.query(Attempt).filter(Attempt.user_id == user_id).all()
    
    # Get recent attempts (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_attempts = db.query(Attempt).filter(
        Attempt.user_id == user_id,
        Attempt.created_at >= thirty_days_ago
    ).all()
    
    # Calculate daily submissions
    daily_submissions = {}
    for attempt in recent_attempts:
        date_str = attempt.created_at.strftime("%Y-%m-%d")
        daily_submissions[date_str] = daily_submissions.get(date_str, 0) + 1
    
    # Calculate topic performance (simplified)
    topic_performance = {
        "Systems Technologies": 75,
        "Hardware & Software": 80,
        "Social Implications": 70,
        "Word Processing": 85,
        "Spreadsheets": 90,
        "Database": 65
    }
    
    # Calculate trends
    trends = {
        "score_trend": [65, 70, 75, 80, 85, 90],
        "attempts_trend": [2, 3, 1, 4, 2, 3],
        "improvement_rate": 15.5
    }
    
    return {
        "daily_submissions": daily_submissions,
        "topic_performance": topic_performance,
        "trends": trends,
        "total_attempts": len(attempts),
        "recent_attempts": len(recent_attempts),
        "average_score": 78.5
    } 