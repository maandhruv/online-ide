FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py runner.py judge.py config.py ./
COPY problems ./problems
COPY .env ./.env
COPY Procfile ./

# Install honcho to run the Procfile
RUN pip install honcho

EXPOSE 8000
# Railway will use the Procfile - this is a fallback
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
