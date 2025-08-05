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
    app.run(host='0.0.0.0', port=port, debug=False) 