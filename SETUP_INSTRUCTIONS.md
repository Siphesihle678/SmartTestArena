<<<<<<< HEAD
# 🚀 CAT Grade 11 Quiz Server Setup Instructions

## 📋 Prerequisites

1. **Python 3.7 or higher** installed on your computer
2. **All students on the same WiFi network** (same router)
3. **Windows Firewall** may need to allow the connection

## 🛠️ Installation Steps

### Step 1: Install Python Dependencies
Open Command Prompt or PowerShell in the folder with your files and run:

```bash
pip install -r requirements.txt
```

### Step 2: Start the Server
Run the server by typing:

```bash
python server.py
```

### Step 3: Share the Network Address
The server will show you:
- Your computer's IP address (e.g., `192.168.1.100`)
- The quiz URL for students (e.g., `http://192.168.1.100:5000`)
- Your dashboard URL (e.g., `http://192.168.1.100:5000/dashboard`)

## 📱 How Students Access the Quiz

1. **Students open their web browser** (Chrome, Firefox, Safari, etc.)
2. **Type the URL** you provided (e.g., `http://192.168.1.100:5000`)
3. **Complete the quiz** and submit
4. **Results are automatically sent** to your computer

## 📊 How You Monitor Results

1. **Open your dashboard** at `http://192.168.1.100:5000/dashboard`
2. **Click "Refresh Data"** to see new submissions
3. **View individual results** with detailed breakdowns
4. **Export to CSV** for record keeping

## 🔧 Troubleshooting

### If students can't connect:
1. **Check Windows Firewall** - Allow Python/Flask through firewall
2. **Verify same network** - All devices must be on same WiFi
3. **Try different browser** - Some browsers block local connections
4. **Check antivirus** - May block local server connections

### If server won't start:
1. **Check Python installation** - Run `python --version`
2. **Install dependencies** - Run `pip install -r requirements.txt`
3. **Check port 5000** - Make sure nothing else is using port 5000

### Windows Firewall Setup:
1. **Open Windows Defender Firewall**
2. **Click "Allow an app through firewall"**
3. **Find Python** and allow it on private networks
4. **Or temporarily disable firewall** for testing

## 📁 File Structure
```
Your Folder/
├── server.py                    # Main server file
├── requirements.txt             # Python dependencies
├── CAT_Grade11_Interactive_Quiz.html  # Quiz for students
├── Tutor_Dashboard.html         # Your results dashboard
├── quiz_submissions.json        # Saved submissions (created automatically)
└── SETUP_INSTRUCTIONS.md        # This file
```

## 🎯 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python server.py

# The server will automatically:
# - Show your IP address
# - Open the quiz in your browser
# - Display the URL for students
```

## 💡 Tips for Online Tutoring

1. **Test first** - Try the quiz yourself before sharing with students
2. **Share screen** - Show students how to access the quiz URL
3. **Monitor dashboard** - Keep the dashboard open to see submissions in real-time
4. **Backup results** - Export CSV files regularly for safekeeping
5. **Network stability** - Ensure stable WiFi connection for all participants

## 🔒 Security Notes

- This server is for **local network use only**
- **Don't expose to the internet** without proper security
- **Close the server** when not in use
- **Data is stored locally** on your computer

## 📞 Support

If you encounter issues:
1. Check that all files are in the same folder
2. Ensure Python 3.7+ is installed
3. Verify all students are on the same WiFi network
=======
# 🚀 CAT Grade 11 Quiz Server Setup Instructions

## 📋 Prerequisites

1. **Python 3.7 or higher** installed on your computer
2. **All students on the same WiFi network** (same router)
3. **Windows Firewall** may need to allow the connection

## 🛠️ Installation Steps

### Step 1: Install Python Dependencies
Open Command Prompt or PowerShell in the folder with your files and run:

```bash
pip install -r requirements.txt
```

### Step 2: Start the Server
Run the server by typing:

```bash
python server.py
```

### Step 3: Share the Network Address
The server will show you:
- Your computer's IP address (e.g., `192.168.1.100`)
- The quiz URL for students (e.g., `http://192.168.1.100:5000`)
- Your dashboard URL (e.g., `http://192.168.1.100:5000/dashboard`)

## 📱 How Students Access the Quiz

1. **Students open their web browser** (Chrome, Firefox, Safari, etc.)
2. **Type the URL** you provided (e.g., `http://192.168.1.100:5000`)
3. **Complete the quiz** and submit
4. **Results are automatically sent** to your computer

## 📊 How You Monitor Results

1. **Open your dashboard** at `http://192.168.1.100:5000/dashboard`
2. **Click "Refresh Data"** to see new submissions
3. **View individual results** with detailed breakdowns
4. **Export to CSV** for record keeping

## 🔧 Troubleshooting

### If students can't connect:
1. **Check Windows Firewall** - Allow Python/Flask through firewall
2. **Verify same network** - All devices must be on same WiFi
3. **Try different browser** - Some browsers block local connections
4. **Check antivirus** - May block local server connections

### If server won't start:
1. **Check Python installation** - Run `python --version`
2. **Install dependencies** - Run `pip install -r requirements.txt`
3. **Check port 5000** - Make sure nothing else is using port 5000

### Windows Firewall Setup:
1. **Open Windows Defender Firewall**
2. **Click "Allow an app through firewall"**
3. **Find Python** and allow it on private networks
4. **Or temporarily disable firewall** for testing

## 📁 File Structure
```
Your Folder/
├── server.py                    # Main server file
├── requirements.txt             # Python dependencies
├── CAT_Grade11_Interactive_Quiz.html  # Quiz for students
├── Tutor_Dashboard.html         # Your results dashboard
├── quiz_submissions.json        # Saved submissions (created automatically)
└── SETUP_INSTRUCTIONS.md        # This file
```

## 🎯 Quick Start Commands

```bash
# Install dependencies
pip install -r requirements.txt

# Start server
python server.py

# The server will automatically:
# - Show your IP address
# - Open the quiz in your browser
# - Display the URL for students
```

## 💡 Tips for Online Tutoring

1. **Test first** - Try the quiz yourself before sharing with students
2. **Share screen** - Show students how to access the quiz URL
3. **Monitor dashboard** - Keep the dashboard open to see submissions in real-time
4. **Backup results** - Export CSV files regularly for safekeeping
5. **Network stability** - Ensure stable WiFi connection for all participants

## 🔒 Security Notes

- This server is for **local network use only**
- **Don't expose to the internet** without proper security
- **Close the server** when not in use
- **Data is stored locally** on your computer

## 📞 Support

If you encounter issues:
1. Check that all files are in the same folder
2. Ensure Python 3.7+ is installed
3. Verify all students are on the same WiFi network
>>>>>>> 19f6c55cb05b175c418cb6d48927185fe0445c97
4. Try disabling Windows Firewall temporarily for testing 