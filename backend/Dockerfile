FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
