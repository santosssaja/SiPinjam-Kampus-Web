# Gunakan image Python ringan
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production

# Set working directory
WORKDIR /app

# Install system dependencies (termasuk yang dibutuhkan untuk compile libsql-ffi)
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv atau update pip
RUN pip install --upgrade pip

# Salin file requirements
COPY requirements.txt .

# Install dependensi (ini akan sukses di Linux Docker)
RUN pip install -r requirements.txt

# Salin kode sumber
COPY . .

# Expose port
EXPOSE 8000

# Jalankan server FastAPI dengan Uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
