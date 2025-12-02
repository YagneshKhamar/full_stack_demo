# Token Service Demo

A minimal Next.js + Prisma + Postgres demo for creating and listing short-lived tokens.

This README explains how to run the project both without Docker (local development) and with Docker (using docker-compose). It also includes test commands and common troubleshooting tips.

---

## Table of Contents

- [Requirements](#requirements)
- [Project Overview](#project-overview)
- [Environment variables](#environment-variables)
- [Run locally (without Docker)](#run-locally-without-docker)
	- [PostgreSQL using Docker (optional)](#postgresql-using-docker-optional)
	- [Install & run](#install--run)
- [Run with Docker](#run-with-docker)
- [Testing & Linting](#testing--linting)
- [Available API endpoints](#available-api-endpoints)
- [Troubleshooting](#troubleshooting)
- [Development notes / project structure](#development-notes--project-structure)

---

## Requirements

- Node.js 22.x (Dockerfile uses `node:22`) – Node 22 is recommended for local development.
- npm (comes with Node.js) – package.json uses npm scripts.
- PostgreSQL 12+ (Postgres 16 used in Docker compose) – database for Prisma.
- Docker & Docker Compose (if using Docker mode)

---

## Project Overview

This is a small Next.js app with a token generation and retrieval API. Prisma is used as an ORM and `@prisma/adapter-pg` is used for the PostgreSQL adapter.

The main features:
- Create short-lived tokens (POST /api/tokens)
- Retrieve active tokens by user id (GET /api/tokens?userId=user-123)
- API key protection on routes using `TOKENS_API_KEY`

---

## Environment variables

Create a `.env` at the project root with the following variables (adjust values for your environment):

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/fullstack_demo?schema=public
TOKENS_API_KEY=super-secret-key
NEXT_PUBLIC_TOKENS_API_KEY=super-secret-key
```

- `DATABASE_URL`: standard Prisma Postgres URL – used by Prisma and by the code.
- `TOKENS_API_KEY`: server-only API key (used by `auth.ts`).
- `NEXT_PUBLIC_TOKENS_API_KEY`: exposed client API key so the Next.js frontend can call the API.

> Note: The repository contains `.env` and `docker.env` examples. Do not commit sensitive values to source control.

---

## Run locally (without Docker)

### PostgreSQL using Docker (optional)

If you do not have Postgres installed locally, you can quickly start a database via Docker:

```powershell
docker run --name fullstack_demo_db -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=fullstack_demo -p 5432:5432 -d postgres:16
```

You can stop the container by running:

```powershell
docker stop fullstack_demo_db; docker rm fullstack_demo_db
```

### Install & run

1. Clone the repository and open a shell in the project root (Windows PowerShell):

```powershell
git clone <repo-url>
cd fullstack_demo
```

2. Create a `.env` file at the project root and set environment variables (see example above).

3. Install dependencies:

```powershell
npm ci
```

4. Generate Prisma client and apply migrations to the database (for development, you can use `migrate dev`):

```powershell
npx prisma generate
npx prisma migrate deploy        # deploy existing migrations (production intended)
# or (development)
# npx prisma migrate dev --name init
```

5. Run the app in development mode:

```powershell
npm run dev
```

Visit `http://localhost:3000` and use the frontend UI to create/list tokens. If running from containerized DB with default values, set `DATABASE_URL` accordingly.

For production build locally:

```powershell
npm run build
npm start
```

> Quick DB test helper:
>
> ```powershell
> npm run db:test
> ```
>
> This will run `scripts/test-db.ts` to verify the DB connection.

---

## Run with Docker

The repository includes a `Dockerfile` and `docker-compose.yml`.

The easiest way to run everything with Docker is with Docker Compose (it will run both the Postgres database and the app service):

```powershell
docker compose up --build
```

- The app will be accessible at `http://localhost:3000`.
- The `docker-compose.yml` uses a `db` service and sets the app's `DATABASE_URL` to point to `db`.

If you'd like to build only the app image (for CI or custom setups):

```powershell
docker build -t token-service --build-arg DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fullstack_demo?schema=public" .
```

And run it (requires a running Postgres instance accessible at `localhost:5432`):

```powershell
docker run -it --rm -p 3000:3000 --env DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/fullstack_demo?schema=public" --env TOKENS_API_KEY=super-secret-key --env NEXT_PUBLIC_TOKENS_API_KEY=super-secret-key token-service
```

> Note: The `Dockerfile`'s entrypoint runs `npx prisma migrate deploy && npm start`, so the container will apply migrations on start.

---

## Testing & Linting

- Run unit tests (Vitest):

```powershell
npm test
```

- Lint:

```powershell
npm run lint
```

---

## Available API endpoints

- POST `/api/tokens`
	- Create a new token.
	- Body JSON schema: { userId, scopes: string[], expiresInMinutes }
	- Requires `x-api-key` header (match `TOKENS_API_KEY`).
	- Example curl:

```powershell
curl -X POST http://localhost:3000/api/tokens \
	-H "Content-Type: application/json" \
	-H "x-api-key: super-secret-key" \
	-d '{"userId":"user-123","scopes":["read"],"expiresInMinutes":60}'
```

- GET `/api/tokens?userId=user-123`
	- Get active tokens for a user.
	- Requires `x-api-key` header.
	- Example curl:

```powershell
curl "http://localhost:3000/api/tokens?userId=user-123" -H "x-api-key: super-secret-key"
```

---

## Troubleshooting

- `Error: TOKENS_API_KEY is not set`: Ensure `TOKENS_API_KEY` is present in your `.env` or Docker environment.
- `PrismaClientUnknownRequestError` or DB connection errors: verify `DATABASE_URL` is correct and DB is reachable. If running Postgres via Docker, ensure the container is running and the port mapping is correct.
- If you need to inspect logs:
	- `docker compose logs` for Docker
	- `npm run dev` console output for local

---

## Development notes / project structure

Main folders:

- `src/app` – Next.js app & pages.
- `src/domain/tokens` – Token domain logic, validation and services.
- `src/lib` – DB and auth helpers.
- `prisma` – Prisma schema and migrations.

---

If you want me to add a CONTRIBUTING guide, or example `.env.example` file, I can add that as a follow-up. Happy hacking! 🚀
