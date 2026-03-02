# Habit Loop

A Progressive Web App (PWA) habit tracker built with an offline-first architecture. All interactions are instant — data is stored locally in IndexedDB and synced to the backend when online.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, TypeScript |
| UI | Tailwind CSS, shadcn/ui (Radix UI primitives) |
| Offline Data | Dexie.js (IndexedDB), TanStack Query v5 |
| Backend | NestJS 11, Prisma 6, SQLite |
| PWA | Serwist (service worker, precaching, offline fallback) |


## Features

- **Zero-latency habit tracking** — toggle, create, delete habits with instant UI response
- **Offline-first** — works without internet, syncs automatically when back online
- **Dark / Light mode** — toggle in the header, persists across sessions
- **GitHub-style heatmap** — 20-week activity grid showing completion intensity
- **Streak tracking** — consecutive-day streaks displayed per habit
- **Sync status indicator** — Online (green), Offline (amber), Syncing (blue) badge
- **PWA installable** — add to home screen on mobile for a native app feel
- **Device-based identity** — auto-generated device UUID, no login required
- **Conflict resolution** — last-write-wins via `updatedAt` timestamp comparison

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
# Clone the repo
git clone https://github.com/nthvan2/habit-loop.git
cd habit-loop

# Install all dependencies (root + web + api)
npm install
cd web && npm install && cd ..
cd api && npm install && cd ..
```

### Run (Development)

```bash
# Terminal 1 — Backend (port 3001)
cd api
npx prisma migrate dev
npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd web
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> The frontend works fully without the backend. If the API is not running, habits are stored locally and sync is silently skipped.

### Build (Production)

```bash
# Backend
cd api && npm run build

# Frontend
cd web && npm run build
```

### Environment Variables

**Frontend** (`web/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**Backend** (`api/.env`):
```
DATABASE_URL="file:./dev.db"
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

