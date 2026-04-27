# Speaking Agent

An AI-powered English speaking coach that helps users improve 
confidence, fluency, grammar, and pronunciation.

## Tech Stack
- Mobile: React Native (Expo) + TypeScript
- Backend: FastAPI (Python)
- Database: PostgreSQL
- AI: Speech-to-text, LLM, Text-to-speech

## Run the Mobile App
cd mobile
npx expo start

## Run the Backend
cd backend
venv\Scripts\activate
uvicorn app.main:app --reload