"""
Vercel Serverless Function entrypoint for MPLADS AI Service.
Exposes the FastAPI application instance as `app`.
"""

import sys
from pathlib import Path

# Ensure ai-service root directory is in sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

from main import app
