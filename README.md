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
- **🔐 Secure & Robust**: Built on top of Next.js 15 and Supabase with enterprise-grade security.

---

## 🛠️ Technology Stack

Tablely is built using the latest modern web technologies:

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Shadcn UI](https://shadcn.com/)
- **Backend / Database**: [Supabase](https://supabase.com/)
- **State Management**: [TanStack Query](https://tanstack.com/query)
- **Validation**: [Zod](https://github.com/colinhacks/zod)
- **Monorepo Management**: [Turborepo](https://turborepo.org/)
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
└── web/                  # Next.js Application
    ├── app/              # App Router Pages
    │   ├── (marketing)/  # Landing pages
    │   ├── auth/         # Authentication flows
    │   ├── home/         # Dashboard & Restaurant Admin
    │   └── restaurant/   # Public restaurant profiles
    └── supabase/         # Migrations & Seed data

packages/
├── ui/                   # Shared UI Component Library
├── supabase/             # Shared Supabase Clients & Utils
└── next/                 # Next.js specific utilities
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

This project is licensed under the MIT License.

---

*Built with ❤️ by the Tablely Team.*

