#!/bin/bash
# Build script for Render deployment

# Install dependencies
pip install -r requirements.txt

# Run database migrations (if using Alembic)
# alembic upgrade head

# Create database tables on startup (handled in main.py on_event)
echo "✅ Build script completed successfully"
