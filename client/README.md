# TaskForge Client

This folder contains the Vite + React + TypeScript single‑page app for TaskForge. It consumes the Express API over cookies and implements the kanban-style boards, task modal, activity feed, and member management UI.

## Stack highlights

- **Vite** for fast dev feedback and optimized builds.
- **React 19 + React Router 7** to render pages and guard authenticated views.
- **React Query v5** for data fetching/caching from `/boards`, `/tasks`, `/activity`.
- **Redux Toolkit** for UI state (filters, toast, modals).
- **Tailwind CSS** for styling; shared primitives live in `/src/components`.
- **`@hello-pangea/dnd`** for kanban drag/drop with server-side `order` persistence.

## Scripts

- `npm run dev` – start the Vite dev server (`http://localhost:5173`); proxies API calls via `VITE_API_BASE_URL`.
- `npm run build` – type-check and produce production assets in `/client/dist`.
- `npm run preview` – preview the built app locally.
- `npm run lint` – run ESLint with TypeScript rules.

## Environment

Create a `.env` file in the `/client` directory when necessary. The only variable consumed here is:

```env
VITE_API_BASE_URL=http://localhost:4000
```

It should point to the running backend (matching `CLIENT_ORIGIN` on the server) so cookies flow correctly.

## Development notes

- Components live under `/src/components`, feature folders under `/src/features`, and shared utilities in `/src/lib`.
- UI state (filters, modals, toast) is managed via `/src/ui/uiSlice.ts`.
- Use `/src/features/tasks/components/TaskModal.tsx` and `/src/features/boards/pages/BoardPage.tsx` as references when extending workflows.
- Run `npm run lint` before pushing large UI changes; ensure `tailwind.config` is updated if new classes are introduced (see `/src/index.css`).

## Testing

Frontend tests run with Vitest and React Testing Library. Execute:

```bash
npm run test
```

or scoped `npm --prefix client test`.
