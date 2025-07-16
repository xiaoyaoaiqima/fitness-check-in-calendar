# Fitness Check-in Calendar

A fitness check-in calendar application built with React, Vite, and Vercel. Features user authentication with Upstash Redis.

## Features

- 📅 Interactive calendar for fitness check-ins
- 🔐 User authentication (login/register)
- 📊 Progress tracking and statistics
- ⚙️ Customizable exercise types
- 📱 Responsive design
- ☁️ Cloud deployment with Vercel

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Vercel Serverless Functions
- **Database**: Upstash Redis
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS

## Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in Vercel:
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
   - `JWT_SECRET` (optional, will use default if not set)

## Development

```bash
npm run dev
```

## Deployment

The app is configured for deployment on Vercel. Simply connect your GitHub repository to Vercel and it will automatically deploy.

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Token verification
