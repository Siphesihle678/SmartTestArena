<<<<<<< HEAD
#!/usr/bin/env python3
"""
Enhanced Quiz Server for CAT Grade 11 Tutoring
This server hosts the quiz and collects student submissions with advanced analytics
"""

from flask import Flask, render_template, request, jsonify, send_from_directory, send_file
import json
import os
from datetime import datetime, timedelta
import threading
import webbrowser
import socket
import uuid
import csv
import io
from collections import defaultdict, Counter
import statistics
import zipfile
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
import base64

app = Flask(__name__)

# Enhanced data storage
submissions = []
students = {}  # Student profiles
questions_bank = {}  # Question bank management
analytics = {
    'total_submissions': 0,
    'average_scores': {},
    'topic_performance': {},
    'daily_submissions': {},
    'class_performance': {}
}

# Get local IP address
def get_local_ip():
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

@app.route('/')
def index():
    return send_from_directory('.', 'CAT_Grade11_Interactive_Quiz.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('.', 'Tutor_Dashboard.html')

@app.route('/analytics')
def analytics_dashboard():
    return send_from_directory('.', 'Analytics_Dashboard.html')

@app.route('/question-bank')
def question_bank():
    return send_from_directory('.', 'Question_Bank_Manager.html')

@app.route('/student-profiles')
def student_profiles():
    return send_from_directory('.', 'Student_Profiles.html')

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        data['submission_id'] = str(uuid.uuid4())
        data['submission_time'] = datetime.now().isoformat()
        data['ip_address'] = request.remote_addr
        
        # Calculate scores and analytics
        data = calculate_quiz_results(data)
        
        # Update student profile
        update_student_profile(data)
        
        # Update analytics
        update_analytics(data)
        
        submissions.append(data)
        
        # Save all data
        save_all_data()
        
        return jsonify({
            "success": True, 
            "message": "Quiz submitted successfully!",
            "results": data.get('results', {}),
            "recommendations": generate_recommendations(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_submissions')
def get_submissions():
    return jsonify(submissions)

@app.route('/get_analytics')
def get_analytics():
    return jsonify(analytics)

@app.route('/get_students')
def get_students():
    return jsonify(students)

@app.route('/get_questions_bank')
def get_questions_bank():
    return jsonify(questions_bank)

@app.route('/add_question', methods=['POST'])
def add_question():
    try:
        data = request.json
        question_id = str(uuid.uuid4())
        data['question_id'] = question_id
        data['created_at'] = datetime.now().isoformat()
        questions_bank[question_id] = data
        save_all_data()
        return jsonify({"success": True, "question_id": question_id})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/update_question/<question_id>', methods=['PUT'])
def update_question(question_id):
    try:
        data = request.json
        if question_id in questions_bank:
            questions_bank[question_id].update(data)
            questions_bank[question_id]['updated_at'] = datetime.now().isoformat()
            save_all_data()
            return jsonify({"success": True})
        return jsonify({"success": False, "error": "Question not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/delete_question/<question_id>', methods=['DELETE'])
def delete_question(question_id):
    try:
        if question_id in questions_bank:
            del questions_bank[question_id]
            save_all_data()
            return jsonify({"success": True})
        return jsonify({"success": False, "error": "Question not found"}), 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/export_results')
def export_results():
    try:
        format_type = request.args.get('format', 'csv')
        
        if format_type == 'csv':
            return export_csv()
        elif format_type == 'pdf':
            return export_pdf()
        elif format_type == 'excel':
            return export_excel()
        else:
            return jsonify({"success": False, "error": "Unsupported format"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_student_progress/<student_email>')
def get_student_progress(student_email):
    try:
        student_submissions = [s for s in submissions if s.get('email') == student_email]
        return jsonify({
            "submissions": student_submissions,
            "progress": calculate_student_progress(student_submissions)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_leaderboard')
def get_leaderboard():
    try:
        # Calculate leaderboard based on recent submissions
        recent_submissions = [s for s in submissions 
                            if datetime.fromisoformat(s['submission_time']) > 
                            datetime.now() - timedelta(days=7)]
        
        leaderboard = []
        for submission in recent_submissions:
            total_score = submission.get('total_score', 0)
            leaderboard.append({
                'name': submission.get('student_name', 'Anonymous'),
                'email': submission.get('email', ''),
                'score': total_score,
                'date': submission['submission_time']
            })
        
        # Sort by score descending
        leaderboard.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify(leaderboard[:10])  # Top 10
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

def calculate_quiz_results(data):
    """Calculate detailed quiz results and scores"""
    results = {
        'theory_score': 0,
        'practical_score': 0,
        'total_score': 0,
        'topic_scores': {},
        'correct_answers': 0,
        'total_questions': 0
    }
    
    # Define correct answers (you can expand this)
    correct_answers = {
        '1.1': 'Input, Output, Processing, Storage',
        '1.2': 'Printer',
        '1.3': 'Temporary storage for running programs',
        '2.1': 'Solid State Drive',
        '2.2': 'Solid State Drive (SSD)',
        '2.3': 'To uniquely identify each record',
        '3.1': 'Bring Your Own Device',
        '3.2': 'Malware',
        '4.1': 'Press Ctrl + Shift + L',
        '4.2': 'To search for and change specific text',
        '5.1': 'Adds numbers that meet a specific condition',
        '5.2': 'Using $ signs to lock cell references',
        '5.3': 'Invalid cell reference',
        '6.1': 'A column of data',
        '6.2': 'Design view'
    }
    
    # Calculate scores
    theory_questions = ['1.1', '1.2', '1.3', '2.1', '2.2', '2.3', '3.1', '3.2']
    practical_questions = ['4.1', '4.2', '5.1', '5.2', '5.3', '6.1', '6.2']
    
    for question_id, correct_answer in correct_answers.items():
        student_answer = data.get(f'question_{question_id}', '')
        if student_answer == correct_answer:
            results['correct_answers'] += 1
            if question_id in theory_questions:
                results['theory_score'] += 1
            elif question_id in practical_questions:
                results['practical_score'] += 1
        
        results['total_questions'] += 1
    
    # Calculate percentages
    results['total_score'] = (results['correct_answers'] / results['total_questions']) * 100
    results['theory_percentage'] = (results['theory_score'] / len(theory_questions)) * 100
    results['practical_percentage'] = (results['practical_score'] / len(practical_questions)) * 100
    
    # Topic scores
    results['topic_scores'] = {
        'Systems Technologies': (results['theory_score'] / 3) * 100,
        'Hardware & Software': (results['theory_score'] / 3) * 100,
        'Social Implications': (results['theory_score'] / 2) * 100,
        'Word Processing': (results['practical_score'] / 2) * 100,
        'Spreadsheets': (results['practical_score'] / 3) * 100,
        'Database': (results['practical_score'] / 2) * 100
    }
    
    data['results'] = results
    return data

def update_student_profile(data):
    """Update or create student profile"""
    email = data.get('email', '')
    if email:
        if email not in students:
            students[email] = {
                'name': data.get('student_name', ''),
                'email': email,
                'first_submission': data['submission_time'],
                'submissions_count': 0,
                'average_score': 0,
                'best_score': 0,
                'weakest_topics': [],
                'strongest_topics': []
            }
        
        students[email]['submissions_count'] += 1
        students[email]['last_submission'] = data['submission_time']
        
        # Update scores
        current_score = data['results']['total_score']
        if current_score > students[email]['best_score']:
            students[email]['best_score'] = current_score
        
        # Calculate average score
        all_scores = [s['results']['total_score'] for s in submissions 
                     if s.get('email') == email]
        students[email]['average_score'] = statistics.mean(all_scores) if all_scores else 0

def update_analytics(data):
    """Update global analytics"""
    analytics['total_submissions'] += 1
    
    # Update daily submissions
    today = datetime.now().date().isoformat()
    if today not in analytics['daily_submissions']:
        analytics['daily_submissions'][today] = 0
    analytics['daily_submissions'][today] += 1
    
    # Update topic performance
    topic_scores = data['results']['topic_scores']
    for topic, score in topic_scores.items():
        if topic not in analytics['topic_performance']:
            analytics['topic_performance'][topic] = []
        analytics['topic_performance'][topic].append(score)
    
    # Update average scores
    for topic, scores in analytics['topic_performance'].items():
        analytics['average_scores'][topic] = statistics.mean(scores)

def generate_recommendations(data):
    """Generate personalized study recommendations"""
    recommendations = []
    topic_scores = data['results']['topic_scores']
    
    # Find weakest topics
    weakest_topics = sorted(topic_scores.items(), key=lambda x: x[1])[:2]
    
    for topic, score in weakest_topics:
        if score < 70:
            recommendations.append(f"Focus on improving your {topic} skills")
    
    if data['results']['total_score'] < 60:
        recommendations.append("Consider reviewing the fundamental concepts")
    
    if data['results']['theory_score'] < data['results']['practical_score']:
        recommendations.append("Practice more theory questions")
    else:
        recommendations.append("Focus on practical application")
    
    return recommendations

def calculate_student_progress(student_submissions):
    """Calculate detailed student progress"""
    if not student_submissions:
        return {}
    
    progress = {
        'total_attempts': len(student_submissions),
        'score_trend': [],
        'topic_improvement': {},
        'study_recommendations': []
    }
    
    # Sort by submission time
    sorted_submissions = sorted(student_submissions, 
                              key=lambda x: x['submission_time'])
    
    # Calculate score trend
    for submission in sorted_submissions:
        progress['score_trend'].append({
            'date': submission['submission_time'],
            'score': submission['results']['total_score']
        })
    
    return progress

def export_csv():
    """Export results as CSV"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Student Name', 'Email', 'Date', 'Total Score', 
                    'Theory Score', 'Practical Score', 'Topics'])
    
    # Write data
    for submission in submissions:
        topics = ', '.join([f"{topic}: {score:.1f}%" 
                          for topic, score in submission['results']['topic_scores'].items()])
        writer.writerow([
            submission.get('student_name', ''),
            submission.get('email', ''),
            submission['submission_time'],
            f"{submission['results']['total_score']:.1f}%",
            f"{submission['results']['theory_percentage']:.1f}%",
            f"{submission['results']['practical_percentage']:.1f}%",
            topics
        ])
    
    output.seek(0)
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        download_name=f'quiz_results_{datetime.now().strftime("%Y%m%d")}.csv'
    )

def export_pdf():
    """Export results as PDF"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30
    )
    
    # Add title
    elements.append(Paragraph("CAT Grade 11 Quiz Results Report", title_style))
    elements.append(Spacer(1, 12))
    
    # Add summary table
    summary_data = [['Student Name', 'Email', 'Total Score', 'Date']]
    for submission in submissions[-10:]:  # Last 10 submissions
        summary_data.append([
            submission.get('student_name', ''),
            submission.get('email', ''),
            f"{submission['results']['total_score']:.1f}%",
            submission['submission_time'][:10]
        ])
    
    summary_table = Table(summary_data)
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 14),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    elements.append(summary_table)
    doc.build(elements)
    
    buffer.seek(0)
    return send_file(
        buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'quiz_report_{datetime.now().strftime("%Y%m%d")}.pdf'
    )

def export_excel():
    """Export results as Excel (simulated with CSV for now)"""
    return export_csv()

def save_all_data():
    """Save all data to files"""
    try:
        # Save submissions
        with open('quiz_submissions.json', 'w') as f:
            json.dump(submissions, f, indent=2)
        
        # Save students
        with open('students.json', 'w') as f:
            json.dump(students, f, indent=2)
        
        # Save questions bank
        with open('questions_bank.json', 'w') as f:
            json.dump(questions_bank, f, indent=2)
        
        # Save analytics
        with open('analytics.json', 'w') as f:
            json.dump(analytics, f, indent=2)
    except Exception as e:
        print(f"Error saving data: {e}")

def load_all_data():
    """Load all data from files"""
    global submissions, students, questions_bank, analytics
    
    try:
        if os.path.exists('quiz_submissions.json'):
            with open('quiz_submissions.json', 'r') as f:
                submissions = json.load(f)
        
        if os.path.exists('students.json'):
            with open('students.json', 'r') as f:
                students = json.load(f)
        
        if os.path.exists('questions_bank.json'):
            with open('questions_bank.json', 'r') as f:
                questions_bank = json.load(f)
        
        if os.path.exists('analytics.json'):
            with open('analytics.json', 'r') as f:
                analytics = json.load(f)
    except Exception as e:
        print(f"Error loading data: {e}")

def open_browser():
    """Open the quiz in default browser"""
    local_ip = get_local_ip()
    url = f"http://{local_ip}:5000"
    print(f"\n🌐 Enhanced Quiz Server is running!")
    print(f"📱 Students can access the quiz at: {url}")
    print(f"📊 Analytics dashboard at: {url}/analytics")
    print(f"👥 Student profiles at: {url}/student-profiles")
    print(f"❓ Question bank at: {url}/question-bank")
    print(f"💡 Make sure all students are on the same WiFi network!")
    webbrowser.open(url)

if __name__ == '__main__':
    # Load existing data
    load_all_data()
    
    # Get port from environment variable (for cloud deployment)
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Starting Enhanced CAT Grade 11 Quiz Server...")
    print(f"🌍 Server will be available on port: {port}")
    
    # Run the server
=======
#!/usr/bin/env python3
"""
Simple Quiz Server for CAT Grade 11 Tutoring
This server hosts the quiz and collects student submissions
"""

from flask import Flask, render_template, request, jsonify, send_from_directory
import json
import os
from datetime import datetime
import threading
import webbrowser
import socket

app = Flask(__name__)

# Store submissions in memory (you can save to file if needed)
submissions = []

# Get local IP address
def get_local_ip():
    try:
        # Connect to a remote address to get local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

@app.route('/')
def index():
    return send_from_directory('.', 'CAT_Grade11_Interactive_Quiz.html')

@app.route('/dashboard')
def dashboard():
    return send_from_directory('.', 'Tutor_Dashboard.html')

@app.route('/submit_quiz', methods=['POST'])
def submit_quiz():
    try:
        data = request.json
        data['submission_time'] = datetime.now().isoformat()
        data['ip_address'] = request.remote_addr
        
        submissions.append(data)
        
        # Save to file for persistence
        save_submissions()
        
        return jsonify({"success": True, "message": "Quiz submitted successfully!"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/get_submissions')
def get_submissions():
    return jsonify(submissions)

def save_submissions():
    """Save submissions to a JSON file"""
    try:
        with open('quiz_submissions.json', 'w') as f:
            json.dump(submissions, f, indent=2)
    except Exception as e:
        print(f"Error saving submissions: {e}")

def load_submissions():
    """Load submissions from JSON file"""
    global submissions
    try:
        if os.path.exists('quiz_submissions.json'):
            with open('quiz_submissions.json', 'r') as f:
                submissions = json.load(f)
    except Exception as e:
        print(f"Error loading submissions: {e}")

def open_browser():
    """Open the quiz in default browser"""
    local_ip = get_local_ip()
    url = f"http://{local_ip}:5000"
    print(f"\n🌐 Quiz Server is running!")
    print(f"📱 Students can access the quiz at: {url}")
    print(f"📊 You can view results at: {url}/dashboard")
    print(f"\n💡 Make sure all students are on the same WiFi network!")
    webbrowser.open(url)

if __name__ == '__main__':
    # Load existing submissions
    load_submissions()
    
    # Get port from environment variable (for cloud deployment)
    port = int(os.environ.get('PORT', 5000))
    
    print("🚀 Starting CAT Grade 11 Quiz Server...")
    print(f"🌍 Server will be available on port: {port}")
    
    # Run the server
>>>>>>> 19f6c55cb05b175c418cb6d48927185fe0445c97
    app.run(host='0.0.0.0', port=port, debug=False) 