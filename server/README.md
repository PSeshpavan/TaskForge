# TaskForge API

This folder contains the Express + TypeScript + Mongoose backend that powers TaskForge. It exposes authenticated routes for user registration, login, board/task management, activity, and member permissions, all secured by Passport + JWT in an `access_token` cookie.

## Stack overview

- **Express 5** with modular routers in `/src/modules`.
- **MongoDB** with Mongoose models (`Board`, `BoardMember`, `Task`, `Activity`, `User`).
- **Passport-local** + JWT middleware for authentication.
- **Zod** for request validation (schemas in each module).
- **TypeScript** for strict typing and shared interfaces.

## Scripts

- `npm run dev` – start the server with `ts-node-dev` (auto restarts).
- `npm run build` – compile TypeScript to `/dist`.
- `npm run start` – run the compiled output (`node dist/index.js`).
- `npm run test` – Jest tests (unit + integration using mongodb-memory-server).

## Environment variables

Create a `.env` file in `/server` with the following keys:

```env
PORT=4000
NODE_ENV=development   # or production/test
CLIENT_ORIGIN=http://localhost:5173
MONGO_URI=mongodb://localhost:27017/taskforge
JWT_SECRET=some-secret
```

- `CLIENT_ORIGIN` controls the CORS + cookie domain that the React app uses.
- `JWT_SECRET` is required unless `NODE_ENV=test`.

## Architecture notes

- Controllers live under `/src/modules/*/controller.ts` and call services (`*.service.ts`), which interact with Mongoose models.
- `/src/middleware/requireAuth.ts` and helpers like `/src/modules/boards/boards.service.ts` enforce role-based permissions for boards, tasks, and activities.
- Activities are recorded via `/src/modules/activity/activity.service.ts` whenever boards/tasks/members change.
- The server logs carry breadcrumbs (`[boardsController] ...`) to aid debugging.

## Testing and linting

- Backend Jest tests use `mongodb-memory-server`; run `npm run test` to execute.
- Linting is not configured separately—ensure TypeScript compiles cleanly (`npm run build`) before releasing.
