FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy project files for dependency caching
COPY pyproject.toml .
COPY README.md .

# Install dependencies
RUN uv sync --no-dev --no-install-project

# Copy application code
COPY . .

# Install project
RUN uv sync --no-dev

EXPOSE 8000

# Seed the database then start the API server
CMD ["sh", "-c", "uv run python -m app.data.seed && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
