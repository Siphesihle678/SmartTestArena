#!/usr/bin/env python3
"""
Simple test server to isolate the issue
"""

from fastapi import FastAPI

app = FastAPI(title="Test Server")

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/test")
def test_endpoint():
    return {"status": "Server is working"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 