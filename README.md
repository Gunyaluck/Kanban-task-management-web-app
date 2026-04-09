## Kanban Task Management App

A full‑stack Kanban board app built with Next.js (App Router), Supabase Auth, and PostgreSQL (Supabase) via Prisma.

### Highlights

- **Auth**: Sign up / login with Supabase Auth
- **Boards / Columns / Tasks**: CRUD APIs with per‑user access control
- **Subtasks**: Create subtasks, toggle completion (persisted in DB)
- **Drag & drop**: Move tasks within and across columns (position persisted)
- **Responsive UI**: Mobile‑first layout + sidebar for larger screens
- **Theme**: Light/Dark mode

### Demo account

Use this account to explore the app quickly:

- **Email**: `testuser@gmail.com`
- **Password**: `12345678`

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Radix UI (Select/Dropdown)
- **Backend**: Next.js Route Handlers (`src/app/api/*`)
- **Auth**: Supabase (`@supabase/supabase-js`)
- **Database / ORM**: PostgreSQL (Supabase) + Prisma v7

## Features (API overview)

All endpoints require an **`Authorization: Bearer <access_token>`** header (Supabase access token).

- **Boards**
  - `GET /api/boards`
  - `POST /api/boards`
  - `GET /api/boards/:boardId` (includes columns → tasks → subtasks)
  - `PATCH /api/boards/:boardId`
  - `DELETE /api/boards/:boardId`
- **Columns**
  - `POST /api/boards/:boardId/columns`
  - `PATCH /api/columns/:columnId`
  - `DELETE /api/columns/:columnId`
- **Tasks**
  - `POST /api/tasks` (supports nested subtasks creation)
  - `PATCH /api/tasks/:taskId` (updates task and can replace subtasks)
  - `DELETE /api/tasks/:taskId`
  - `POST /api/tasks/reorder` (bulk reorder to persist positions safely)
- **Subtasks**
  - `PATCH /api/subtasks/:subtaskId` (toggle `is_completed`)

## Getting Started (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Create `.env`

Create a `.env` in the project root. Minimum required:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://<your-project-ref>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<your-anon-key>"
SUPABASE_SERVICE_ROLE_KEY="<your-service-role-key>"

# Postgres (Supabase)
# Runtime: Transaction pooler
DATABASE_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres?sslmode=require"

# Prisma CLI / migrations: Session pooler
DIRECT_URL="postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:5432/postgres?sslmode=require"
```

### 3) Apply migrations + generate Prisma client

```bash
npx prisma migrate dev
npx prisma generate
```

### 4) Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Deploy (Vercel)

Add the same environment variables from `.env` to Vercel Project Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (Transaction pooler)
- `DIRECT_URL` (Session pooler)

> Prisma client is generated automatically on install via `postinstall`.

## Notes

- The default board **“Platform Launch”** is automatically created when a new user profile is created via `POST /api/users`.
- Positions are persisted using `position` columns in the DB.
- This repository is intended as a portfolio‑ready project: clean UI, pragmatic APIs, and a clear data model.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
