# 🚀 Cloud Deployment Guide for CAT Grade 11 Quiz

## Deploy to Railway (Recommended - Free & Easy)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (recommended) or email

### Step 2: Connect Your Code
1. **Option A: GitHub (Recommended)**
   - Push your code to a GitHub repository
   - In Railway, click "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's a Python app

2. **Option B: Direct Upload**
   - In Railway, click "Deploy from template"
   - Choose "Empty Project"
   - Upload your files manually

### Step 3: Configure Environment
Railway will automatically:
- Detect Python requirements
- Install dependencies from `requirements.txt`
- Use the `Procfile` to start the server
- Assign a public URL

### Step 4: Get Your Public URL
1. Once deployed, Railway will show you a URL like:
   `https://your-app-name.railway.app`
2. This is your **public quiz URL** that students can access from anywhere!

### Step 5: Share with Students
- **Quiz URL**: `https://your-app-name.railway.app`
- **Dashboard URL**: `https://your-app-name.railway.app/dashboard`

## Alternative: Deploy to Render

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub

### Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `cat-grade11-quiz`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python server.py`

### Step 3: Deploy
1. Click "Create Web Service"
2. Render will build and deploy your app
3. Get your public URL from the dashboard

## Alternative: Deploy to Heroku

### Step 1: Create Heroku Account
1. Go to [heroku.com](https://heroku.com)
2. Sign up for free account

### Step 2: Install Heroku CLI
```bash
# Download from: https://devcenter.heroku.com/articles/heroku-cli
```

### Step 3: Deploy via CLI
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-quiz-app-name

# Add files to git
git add .
git commit -m "Initial deployment"

# Deploy
git push heroku main

# Open your app
heroku open
```

## File Structure for Deployment
```
Your Project/
├── server.py                    # Main Flask app
├── requirements.txt             # Python dependencies
├── Procfile                     # Tells platform how to run app
├── runtime.txt                  # Python version
├── .gitignore                   # Files to exclude
├── CAT_Grade11_Interactive_Quiz.html  # Quiz for students
├── Tutor_Dashboard.html         # Your results dashboard
└── DEPLOYMENT_GUIDE.md          # This file
```

## Important Notes

### Security
- Your quiz data will be stored on the cloud platform
- Only you can access the dashboard with the `/dashboard` URL
- Students can only submit quiz answers

### Data Persistence
- Railway/Render/Heroku may restart your app periodically
- Quiz submissions are stored in memory and may be lost on restart
- For permanent storage, consider adding a database (PostgreSQL)

### Cost
- **Railway**: Free tier available, $5/month for more resources
- **Render**: Free tier available
- **Heroku**: No longer free, starts at $7/month

## Quick Start Commands

### For Railway (Recommended)
1. Create account at [railway.app](https://railway.app)
2. Connect GitHub repository
3. Deploy automatically
4. Get public URL instantly

### Testing Your Deployment
1. Visit your public URL
2. Take the quiz yourself to test
3. Check the dashboard for your submission
4. Share the URL with students

## Troubleshooting

### Common Issues
1. **App won't start**: Check `requirements.txt` and `Procfile`
2. **Port issues**: Make sure server uses `os.environ.get('PORT', 5000)`
3. **Static files**: Ensure HTML files are in the same directory as `server.py`

### Getting Help
- Railway: [docs.railway.app](https://docs.railway.app)
- Render: [render.com/docs](https://render.com/docs)
- Heroku: [devcenter.heroku.com](https://devcenter.heroku.com)

## Next Steps After Deployment
1. Test the quiz yourself
2. Share the URL with your students
3. Monitor submissions in the dashboard
4. Export results as needed
5. Consider adding a database for permanent storage

---

**🎯 Recommendation**: Start with Railway - it's the easiest and most reliable free option for your needs! 