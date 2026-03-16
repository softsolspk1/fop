# KU APP - Online Class Portal & Mobile App

This is a monorepo containing the full-stack application for the Faculty of Pharmacy, University of Karachi.

## Structure

- `apps/web`: Next.js Web Portal (Admin, Teacher, Student)
- `apps/mobile`: React Native Mobile App (Student, Faculty)
- `packages/api`: Node.js Express Backend
- `packages/database`: Prisma Schema & PostgreSQL Database
- `packages/shared`: Shared TypeScript types and utilities

## Tech Stack

- **Frontend**: Next.js, Tailwind CSS, Lucide Icons, Framer Motion
- **Mobile**: Expo, React Native, Expo Router
- **Backend**: Express, JWT, Zod, Morgan, Helmet
- **Database**: PostgreSQL, Prisma ORM
- **Integrations**: Agora (Video), Google Drive (Storage)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Setup environment variables:
   Copy `.env.example` to `.env` in `packages/api` and `apps/web`.

3. Run the development server:
   ```bash
   npm run dev
   ```
