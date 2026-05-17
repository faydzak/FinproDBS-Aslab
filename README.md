# PremierLeagueNerd

---

## Overview

PremierLeagueNerd is a final project for the Database Systems Practicum course. It provides a complete Premier League data platform. Users can browse matchdays, league standings, player profiles, and some statistics of 2024/2025 season. Admins can add matches and manage player records through a protected admin panel.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Next.js 16, React 19, Tailwind CSS v4, TypeScript |
| Backend    | Node.js, Express 5, TypeScript    |
| Database   | PostgreSQL (Neon)       |

---

## Features

- **Matches** — Browse all Premier League matches grouped by matchday, with live / finished / scheduled status badges
- **Teams** — View all 20 clubs with badge images, stadium info, and full squad details
- **Players** — Search and filter players by name, team, or position
- **Standings** — Full league table with Champions League, Europa League, and relegation zones highlighted
- **Statistics** — League-wide stats including top scorers and team performance metrics
- **Auth** — Register and log in with role-based access control (admin / user)
- **Admin Panel** — Add and edit matches, manage player records (admin only)

---

### Prerequisites

- Node.js v18+
- npm
- A PostgreSQL connection string (local or [Neon](https://neon.tech))

### 1. Clone the repository

```bash
git clone https://github.com/faydzak/FinproDBS-Aslab.git
cd FinproDBS-Aslab
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (see `.env.example`):

```env
DATABASE_URL=postgres://postgres:password@localhost:5432/premier_league
PORT=4000
NODE_ENV=development
FRONTEND_ORIGIN=http://localhost:3000
JWT_SECRET=your_jwt_secret
```

Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:4000`.

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Database Schema

Core tables:

| Table           | Description                                      |
|-----------------|--------------------------------------------------|
| `teams`         | Club name, badge URL, stadium, founding year     |
| `players`       | Player profile linked to a team                  |
| `matches`       | Fixture data per matchday with status and score  |
| `match_events`  | Goals and assists per player per match           |
| `standings`     | Computed league table positions and zone flags   |
| `users`         | Auth table with hashed passwords and roles       |

The full schema is in [`backend/schema/PremierLeague.sql`](backend/schema/PremierLeague.sql).

---

## API Reference

### Auth

| Method | Endpoint              | Description           | Auth |
|--------|-----------------------|-----------------------|------|
| POST   | `/api/auth/register`  | Register a new user   | —    |
| POST   | `/api/auth/login`     | Login                 | —    |
| POST   | `/api/auth/logout`    | Logout                | ✓    |
| GET    | `/api/auth/me`        | Get current user      | ✓    |

### Public

| Method | Endpoint              | Description                     |
|--------|-----------------------|---------------------------------|
| GET    | `/api/health`         | Health check                    |
| GET    | `/api/matches`        | List all matches by matchday    |
| GET    | `/api/teams`          | List all teams                  |
| GET    | `/api/teams/:id`      | Team details + squad            |
| GET    | `/api/players`        | List all players (filterable)   |
| GET    | `/api/standings`      | Full league table               |
| GET    | `/api/statistics`     | Top scorers and team stats      |
| GET    | `/api/dashboard`      | Dashboard summary               |

### Admin (requires admin role)

| Method | Endpoint                   | Description        |
|--------|----------------------------|--------------------|
| GET    | `/api/admin/summary`       | Admin overview     |
| POST   | `/api/admin/matches`       | Add a match        |
| PUT    | `/api/admin/matches/:id`   | Update a match     |
| DELETE | `/api/admin/players/:id`   | Delete a player    |

---

## Team

Developed as a final project for the **Database Systems Practicum** course.

| Name |
|------|
| Muhammad Naufal Gilardino |
| Muhammad Fairuz Dzaki |
| Raihan Hermuhadzib |
| Ibrahima |
| Aykhan Abbas |
