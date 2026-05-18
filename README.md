# RamPark

RamPark is a smart parking web app for Farmingdale State College students and staff. It combines parking lot status, schedule-aware lot recommendations, valet requests, vehicle profiles, feedback, and campus parking tools in one dashboard.

## Features

- Student sign in and account management with Firebase Authentication
- Interactive parking map with Google Maps
- Parking lot status, predictions, and occupancy indicators
- Schedule upload/manual entry for class-based parking recommendations
- OpenAI-powered ranking for the best parking lots based on schedule, distance, occupancy, weather, and crowd pressure
- Vehicle profile management
- Campus valet request flow with admin approval and status tracking
- Valet payments, history, leaderboard, and notifications
- Feedback collection for parking difficulty and user experience
- Carpool, favorite spots, and reservation-related pages

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, lucide-react
- Backend: FastAPI, Python
- Database/Auth/Storage: Firebase Authentication, Firestore, Firebase Storage
- Maps: Google Maps API
- AI: OpenAI Responses API for schedule recommendations

## Project Structure

```txt
RamPark/
├── ram-park-frontend/     # Next.js app
├── ram-park-backend/      # FastAPI backend
├── README.md
└── serviceAccountKey.json # local only, do not commit
```

## Prerequisites

- Node.js and npm
- Python 3.11+
- Firebase project with Authentication, Firestore, and Storage enabled
- Google Maps API key
- OpenAI API key
- Firebase Admin service account JSON for the backend

## Frontend Setup

```bash
cd ram-park-frontend
npm install
```

Create `ram-park-frontend/.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

Run the frontend:

```bash
npm run dev
```

The frontend runs at:

```txt
http://localhost:3000
```

## Backend Setup

```bash
cd ram-park-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Place your Firebase Admin SDK file at:

```txt
ram-park-backend/serviceAccountKey.json
```

Create `ram-park-backend/.env`:

```env
OPENAI_API_KEY=your_openai_api_key
```

Run the backend:

```bash
uvicorn main:app --reload
```

The backend runs at:

```txt
http://127.0.0.1:8000
```

## OpenAI Schedule Recommendations

The schedule page calls the backend endpoint:

```txt
POST /recommend/suggest
```

The backend ranks parking lots using OpenAI with factors such as:

- First class building
- Class start time
- Minutes until class
- Distance from each lot to the class building
- Predicted and live occupancy
- Weather and rain probability
- Crowd pressure from other schedules
- Lot capacity and risk warnings

If the OpenAI request fails, the backend falls back to the three closest lots so the app can still return recommendations.

To verify OpenAI is being used, check the backend terminal after clicking **Run Analysis** on the schedule page. A successful call prints:

```txt
OPENAI RESPONSE: [...]
```

If OpenAI fails, the backend prints:

```txt
OPENAI FAILED, USING FALLBACK: ...
```

## Common Commands

Frontend:

```bash
cd ram-park-frontend
npm run dev
npm run build
npm run lint
```

Backend:

```bash
cd ram-park-backend
source venv/bin/activate
uvicorn main:app --reload
```

## Security Notes

Do not commit secrets or local credential files:

- `serviceAccountKey.json`
- `.env`
- `.env.local`
- Firebase private keys
- OpenAI API keys

Firebase and OpenAI keys should be configured through local environment files during development and secure environment variables in production.

## Status

RamPark is an active student project. Some features are prototype-level and may need additional production hardening, especially around backend route authorization, Firestore security rules, and deployment configuration.
