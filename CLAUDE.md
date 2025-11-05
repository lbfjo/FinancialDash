# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a personal finance dashboard built with Next.js 16, React 19, Prisma ORM, and Tailwind CSS 4. The application uses PostgreSQL as the database backend via Prisma Postgres.

## Development Commands

### Starting Development
```bash
npm run dev
```
Starts the Next.js development server on http://localhost:3000 with hot-reloading.

### Building for Production
```bash
npm run build
```
Creates an optimized production build.

### Linting
```bash
npm run lint
```
Runs ESLint on the codebase.

### Database Operations

#### Generate Prisma Client
```bash
npx prisma generate
```
Generates the Prisma Client based on the schema. Run after modifying `prisma/schema.prisma`.

#### Run Migrations
```bash
npx prisma migrate dev --name <migration-name>
```
Creates and applies a new migration in development.

#### Push Schema Changes (without migrations)
```bash
npx prisma db push
```
Pushes schema changes directly to the database without creating a migration file.

#### Prisma Studio
```bash
npx prisma studio
```
Opens Prisma Studio GUI for browsing and editing database data.

#### Reset Database
```bash
npx prisma migrate reset
```
Resets the database, applies all migrations, and runs seed scripts if configured.

## Architecture

### Tech Stack
- **Framework**: Next.js 16 with App Router
- **React**: Version 19.2.0
- **Styling**: Tailwind CSS 4 with PostCSS
- **Database**: PostgreSQL via Prisma Postgres (local development)
- **ORM**: Prisma 6.18.0
- **TypeScript**: Strict mode enabled with path aliases (`@/*` maps to `./src/*`)

### Project Structure
```
src/
  app/              # Next.js App Router pages and layouts
    layout.tsx      # Root layout with Geist fonts
    page.tsx        # Home page
    globals.css     # Global styles
prisma/
  schema.prisma     # Database schema
  migrations/       # Migration history
prisma.config.ts    # Prisma configuration
```

### Database Schema

The application uses a financial transaction tracking model with four main entities:

- **User**: Core user entity with email and optional name
- **Account**: Financial accounts owned by users (bank accounts, credit cards, etc.)
- **Category**: Income/expense categories owned by users (enum: INCOME or EXPENSE)
- **Transaction**: Financial transactions linked to users, accounts, and categories
  - Uses `Decimal` type for precise monetary amounts
  - Optional category relationship
  - Required account and user relationships

All models use `cuid()` for IDs and include `createdAt` timestamps.

### Configuration Notes

- **Database URL**: Uses Prisma Postgres with a local connection string in `.env`
- **Prisma Config**: Custom config at `prisma.config.ts` specifying schema path, migrations path, and classic engine
- **TypeScript Paths**: `@/*` is configured to resolve to `./src/*`
- **Fonts**: Uses Geist Sans and Geist Mono from next/font/google

### Current State

This is a newly initialized project with:
- Default Next.js landing page (src/app/page.tsx)
- Prisma schema defined but migrations may not be applied yet
- Basic project structure in place
- No custom components or API routes implemented yet
