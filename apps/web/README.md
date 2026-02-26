# 🌐 Tablely Web Application

This is the main web application for Tablely, built with Next.js 15. It handles both the customer-facing restaurant profiles and the comprehensive admin dashboard for restaurant owners.

## 📁 Key Directories

- **`app/(marketing)`**: Public-facing landing pages and marketing content.
- **`app/restaurant/[slug]`**: Dynamic public profiles for each restaurant.
- **`app/home`**: The "Admin" area where restaurant owners manage their business.
- **`app/auth`**: Authentication flows (login, signup, password reset).
- **`supabase`**: Database migrations, seed data, and configuration.
- **`lib`**: Server-side and client-side utilities specific to the web app.

## 🛠️ Development

To start the web application in development mode:

```bash
pnpm run dev
```

For production builds:

```bash
pnpm run build
```

## 🔐 Configuration

Environment variables are managed in `.env.local` (local) and your hosting provider (production). See the root `README.md` for a list of required variables.
