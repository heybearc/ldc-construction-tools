#!/usr/bin/env python3
"""
Development server startup script for LDC Construction Tools
"""

import uvicorn
from app.db.init_db import init_db

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    
    print("Starting LDC Construction Tools API server...")
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
