#!/usr/bin/env python3
"""
Simple script to start the FastAPI server
"""

print("Starting AYUSH Dual Coding Service...")
import uvicorn

if __name__ == "__main__":
    print("🚀 Starting AYUSH Dual Coding Service...")
    print("📡 Server will be available at: http://127.0.0.1:8000")
    print("📚 API docs will be available at: http://127.0.0.1:8000/docs")
    print("🛑 Press Ctrl+C to stop the server")
    print("-" * 50)
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )
