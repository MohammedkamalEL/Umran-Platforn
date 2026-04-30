# Umran | عمران – System Architecture & Schema

## 1. Textual Architecture Diagram
```
[ Client: React + Vite ]
       |
       |-- [ Local Store: Firestore Offline Persistence ]
       |-- [ Service Worker: Network Interceptor ]
       |
[ Sync Layer: Firebase Cloud Sync ]
       |
[ Backend Services (Firebase) ]
       |-- [ Auth: Google Auth ]
       |-- [ DB: Firestore (NoSQL) ]
       |-- [ Storage: Firebase Storage (Images/Voice) ]
       |-- [ Logic: Cloud Functions (Aggregation/Scoring) ]
       |
[ External Integrations ]
       |-- [ AI: Google Gemini (Dialect Processing) ]
       |-- [ Messaging: Twilio/SMS Gateway ]
```

## 2. Database Schema (Firestore Collections)

### `issues`
- `id`: string
- `type`: enum (road, water, electricity, waste)
- `description`: string
- `voiceUrl`: string (optional)
- `media`: string[] (URLs)
- `location`: GeoPoint
- `status`: enum (pending, verified, in_progress, completed)
- `severity`: number (1-3)
- `reportsCount`: number
- `createdAt`: timestamp
- `updatedAt`: timestamp

### `campaigns`
- `id`: string
- `issueId`: string
- `title`: string
- `description`: string
- `participants`: string[] (User UIDs)
- `goal`: string
- `status`: enum (planning, active, successful, closed)
- `beforeImg`: string
- `afterImg`: string

### `audit_logs`
- `id`: string
- `actorId`: string
- `action`: string
- `targetId`: string
- `timestamp`: timestamp
