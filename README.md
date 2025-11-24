# SA-ITS

HCMUT-CSE. Software Architecture
Assignment: Intelligent Tutoring System

## Project Structure

```
sa-its/
├── backend/          # Django REST Framework API
├── frontend/         # React frontend
└── README.md
```

## Local Development Setup

> **Note:** For detailed backend development instructions, including how to add new Django modules/apps, see [backend/README.md](backend/README.md)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and update values:
   ```bash
   cp .env.example .env
   ```

   For local development with PostgreSQL:
   ```env
   DATABASE_URL=postgresql://its_user:its_password@localhost:5432/its_db
   ```

3. **Run migrations:**
   ```bash
   python manage.py migrate
   ```

4. **Create superuser (optional):**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start development server:**
   ```bash
   python manage.py runserver
   ```

   Backend will be available at:
   - API: http://localhost:8000/
   - Admin: http://localhost:8000/admin/
   - API Docs (Swagger): http://localhost:8000/api/docs/
   - API Docs (ReDoc): http://localhost:8000/api/redoc/
   - OpenAPI Schema: http://localhost:8000/api/schema/

6. **Run test:**
   ```bash
   # Run all testcase
   ./run pytest --create-db

   # Run specific test (test file, test case)
   ./run pytest <test_case>
   ```


### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Frontend will be available at http://localhost:5173/

## Docker Setup for Backend

```bash
cd backend
docker-compose up -d
```

Access at:
- Backend: http://localhost:8000/
- Database: localhost:5432

## Development Tools

### Code Quality

Pre-commit hooks are configured for both backend and frontend:

```bash
# Install pre-commit
pip install pre-commit

# Install pre-commit hooks - this ensures hooks run at commit
pre-commit install

# Manually run pre-commit hooks on all files
pre-commit run --all-files
```

### API Documentation

The backend uses `drf-spectacular` for automatic API documentation:
- Interactive API testing: http://localhost:8000/api/docs/
- Alternative docs view: http://localhost:8000/api/redoc/

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Run pre-commit hooks: `pre-commit run --all-files`
4. Submit a pull request
