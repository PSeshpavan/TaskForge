# TaskForge

TaskForge is a full-stack MERN workspace that combines an Express + Mongo backend with a Vite + React + Tailwind frontend. It ships with JWT cookie authentication, kanban-style boards, task CRUD, activity feeds, and member permissions to mirror a Trello‑lite workflow.

## Repository layout

- `/server` – Express + TypeScript API, Mongoose models, Passport JWT authentication, and zod-based validation.
- `/client` – Vite-powered React application using React Query v5 for data fetching, Redux Toolkit for UI state, React Router v7, Tailwind CSS, and hello-pangea/dnd for kanban drag/drop.

## Getting started

1. **Install dependencies** from the monorepo root:
   ```bash
   npm install
   ```
2. **Configure the backend** by creating a `/server/.env` file with:
   ```env
   PORT=4000
   NODE_ENV=development
   CLIENT_ORIGIN=http://localhost:5173
   MONGO_URI=mongodb://localhost:27017/taskforge
   JWT_SECRET=your-secret-key
   ```
3. **(Optional) set the API base** for the frontend in `/client/.env` (defaults to `http://localhost:4000`):
   ```env
   VITE_API_BASE_URL=http://localhost:4000
   ```
4. **Run both apps**:
   ```bash
   npm run dev
   ```
   This script launches the server and client concurrently (using `concurrently`).

## Available scripts

- `npm run dev` – starts both `/server` and `/client` (watch mode).
- `npm run test` – runs backend (`npm run test` in `/server`) then frontend (`npm run test` in `/client`).
- `npm run test:server` – Jest suite for `/server`.
- `npm run test:client` – Frontend tests via Vitest/Testing Library.

## Workflows

- Work on only one package: `npm --prefix server run dev` or `npm --prefix client run dev`.
- Build for deployment: `npm --prefix client run build` and `npm --prefix server run build`.
- To update shared types or schemas, edit them inside `/server/src/modules` and align `/client/src/features` interfaces.

## Further reading

- `/client/README.md` – frontend-specific instructions, scripts, and conventions.
- `/server/README.md` – API-specific overview, scripts, and environment details.
