FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app/ ./app/

# Create data and artifacts directories
RUN mkdir -p /app/data /app/artifacts/evidence_packs

# Expose port
EXPOSE 8006

# Hot reload for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8006", "--reload"]
