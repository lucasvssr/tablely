# 🍽️ Tablely

**The Ultimate Restaurant Management & Booking Platform.**

Tablely is a modern, high-performance SaaS platform designed to empower restaurant owners and provide a seamless booking experience for diners. Built with a focus on speed, reliability, and elegant design, Tablely handles everything from real-time reservations to complex team management.

---

## ✨ Key Features

- **🎯 Real-time Reservations**: Instant booking confirmation with smart availability management.
- **📊 Business Dashboard**: Beautifully visualized analytics and charts to track your restaurant's performance.
- **👥 Team Management**: Granular role-based access control (Admin, Member) for your staff.
- **🛠️ Service Configuration**: Flexible management of restaurant services, hours, and capacity.
- **📱 Responsive Diner Experience**: A premium, mobile-first interface for public restaurant pages.
- **🔐 Secure & Robust**: Built on top of Next.js 16 and Supabase with enterprise-grade security.
- **📍 Location Intelligence**: Integrated mapping features with latitude/longitude coordinates for restaurants.

---

## 📚 Documentation

Detailed technical documentation is available in the `docs/` directory:

- [**Documentation Index**](./docs/index.md) : The main entry point for all technical guides.
- [**Architecture & Design**](./docs/architecture.md) : Technical design, SSR patterns, and data flow.
- [**Data Models**](./docs/data-models.md) : Database schema, RLS policies, and SQL functions.
- [**API Contracts**](./docs/api-contracts.md) : Catalog of Server Actions and HTTP routes.
- [**Development Guide**](./docs/development-guide.md) : Setup instructions and coding standards.
- [**Technical Presentation**](./docs/technical_presentation.md) : High-level presentation for stakeholders.

---

## 🛠️ Technology Stack

Tablely is built using the latest modern web technologies for maximum performance and scalability:

- **Framework**: [Next.js 16](https://nextjs.org/) (React 19, App Router)
- **Styling**: [Tailwind CSS v4.1](https://tailwindcss.com/) & [Shadcn UI](https://shadcn.com/)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL 17)
- **State Management**: [TanStack Query v5](https://tanstack.com/query)
- **Validation**: [Zod](https://github.com/colinhacks/zod) & [React Hook Form](https://react-hook-form.com/)
- **Monorepo Management**: [Turborepo](https://turborepo.org/) & [PNPM](https://pnpm.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 18.x or later (LTS recommended)
- **Package Manager**: [PNPM](https://pnpm.io/)


### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/lucasvssr/tablely.git
    cd tablely
    ```

2.  **Install Dependencies**
    ```bash
    pnpm install
    ```

3.  **Configuration (Supabase)**
    Copy `.env.example` to `.env.local` and fill in your remote Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your-project-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    ```


4.  **Run Development Server**
    ```bash
    pnpm run dev
    ```
    *Open http://localhost:3000 to see Tablely in action!*

---

## 📂 Project Structure

```text
apps/
├── web/                  # Core Next.js Application
└── e2e/                  # End-to-end playtesting (Playwright)

packages/
├── ui/                   # Design System (Tailwind v4 + Shadcn UI)
├── supabase/             # Shared Database Clients & Logic
├── features/             # Shared Business Features (RBAC/Auth)
├── i18n/                 # Internationalization Framework (FR/EN)
├── next/                 # Next.js & Middleware Utilities
├── shared/               # Common TypeScript Types & Utilities
└── tsconfig/             # Shared build configurations
```

---

## 🧪 Quality & Testing

Tablely maintains high standards for code quality:

- **Formatting**: `pnpm run format:fix`
- **Linting**: `pnpm run lint`
- **Type Checking**: `pnpm run typecheck`
- **E2E Testing**: `pnpm run test` (via Playwright)

---

## 📜 License

This project is licensed under a Proprietary License. All rights reserved.

---

*Built with ❤️ by the Tablely Team.*

