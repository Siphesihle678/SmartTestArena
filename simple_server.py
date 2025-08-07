from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="SmartTest Arena - Simple Server")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "SmartTest Arena Server is running!"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Server is working"}

@app.get("/test")
def test_endpoint():
    return {"data": "Test endpoint working"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting SmartTest Arena Simple Server...")
    uvicorn.run(app, host="0.0.0.0", port=8001) 