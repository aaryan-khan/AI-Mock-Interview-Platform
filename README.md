# InterviewAI — Student Edition

A student-friendly open-source AI mock interview platform built with Next.js, local LLM (Ollama) / Gemini, and browser voice/camera APIs.

## Main flow

Login → Dashboard → Create Interview → AI Interview → Per-answer feedback → Final report → History → Progress

## Pages

- `/dashboard` — overview, recent interviews, score snapshot
- `/interviews/new` — choose role, experience, interview type, and 5/10/15/20 questions
- `/interviews/[id]` — interview room with camera, microphone transcription, question voice playback, and answer evaluation
- `/results/[id]` — detailed report with question-by-question scores and voice feedback
- `/history` — past interview sessions
- `/progress` — average/best/latest performance
- `/about` — project workflow and features
- `/profile` — signed-in account details

## Voice improvements

Speech recognition now appends only final recognition results. Interim speech is displayed separately, which prevents the same words from being appended repeatedly as the browser refines its transcript.

The interview room also includes browser speech synthesis buttons for reading questions and speaking AI feedback aloud.

## Local setup

1. Start Docker Desktop.
2. Run `supabase start`.
3. Run `supabase db reset`.
4. Run `npm install`.
5. Create `.env.local` from `.env.example` and add your Gemini API key plus local Supabase values.
6. Run `npm run dev`.

Open `http://localhost:3000`.
