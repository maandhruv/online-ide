import os
from dotenv import load_dotenv

# Load variables from .env file if it exists
load_dotenv()

# Application settings
DEBUG = os.environ.get("DEBUG", "False").lower() in ("true", "1", "t")
PORT = int(os.environ.get("PORT", 8000))
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")

# Database settings
REDIS_URL = os.environ.get("REDIS_URL", "redis://redis:6379/0")

# Docker settings
DOCKER_SANDBOX_IMAGE = os.environ.get("DOCKER_SANDBOX_IMAGE", "python:3.11-slim")