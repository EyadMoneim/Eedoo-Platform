# Eedoo Platform

Eedoo is a modular personal productivity platform. The long-term vision is to have one central AI assistant called **Eedoo AI** that can interact with multiple independent applications/services (Money, Tasks, Reminders, Notes).

This repository contains the foundation for Phase 1.

## Project Structure

- `frontend/` - React frontend powered by Vite and Tailwind CSS v4.
- `backend/` - FastAPI backend with SQLAlchemy (async) and Alembic for migrations.
- `docs/` - Project documentation and architecture details.

## Environment Variables

Copy the `.env.example` file to `.env` in the project root. **Never commit `.env`!**

```bash
cp .env.example .env
```

## Setup Backend

The backend is built with Python 3 and FastAPI.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Check the health endpoint at: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

## Eedoo chat and email reminders

The home page accepts short Egyptian Arabic or English messages for all six Money transaction types (expenses, income, lending, receiving loan repayments, borrowing, and repaying loans) and email reminders. Set `AI_PROVIDER_API_KEY` in the root `.env` to a Gemini API key from Google AI Studio, then restart the backend so it loads the new value. The key stays on the backend. The default model is `gemini-3.5-flash-lite`; its free tier is limited, and paid API use is billed separately from Google AI Pro.

For reminder email, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `SMTP_FROM` in `.env`. Use an SMTP account that supports STARTTLS on port 587. Reminders are rejected until email is configured. Apply the database migration, then keep the email worker running alongside the API:

```bash
cd backend
alembic upgrade head
python -m app.workers.reminders
```

The worker checks due reminders every 30 seconds and retries failures. For production, run it as a supervised process. Emails may be repeated if the process stops after SMTP accepts a message but before the database marks it sent. Chat history lasts for the open page; saved transactions and reminders persist in the database.

## Setup Frontend

The frontend is built with React, Vite, and Tailwind CSS v4.

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Database Migrations (Future Phase)

Alembic is configured for async SQLAlchemy migrations.

1. Generate a migration:
   ```bash
   cd backend
   alembic revision --autogenerate -m "description"
   ```
2. Apply migrations:
   ```bash
   alembic upgrade head
   ```
