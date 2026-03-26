# 🍽️ Tablely • Présentation du Projet

## 📝 Résumé Exécutif

Tablely est une plateforme SaaS de gestion de réservations et de management pour restaurants conçue pour maximiser l'efficacité opérationnelle. Elle permet aux restaurateurs de gérer leurs services, leurs tables et leurs réservations en temps réel, tout en offrant une expérience de réservation fluide et sans friction aux clients finaux.

## 🛠️ Stack Technique Modernisée

- **Frontend** : Next.js 16 (App Router), React 19, Lucide React.
- **Styling** : Tailwind CSS v4.1, Shadcn UI (basé sur Radix UI).
- **Base de Données & Infra** : Supabase (PostgreSQL 17, Auth, Realtime).
- **Sécurité** : Row Level Security (RLS) granulaire au niveau de la base de données.
- **Gestion d'État & Fetching** : TanStack Query v5.
- **Validation** : Zod & React Hook Form (validation bout-en-bout).
- **Monorepo** : Turborepo, PNPM (Gestion des espaces de travail).

## 🏗️ Structure Simplifiée du Projet

Le projet adopte une architecture Monorepo pour séparer les applications de la logique réutilisable :

### Applications (`apps/`)
- `web` : Cœur technologique (Next.js) incluant le dashboard admin et les pages de réservation.
- `e2e` : Validation critique via des tests de bout en bout (Playwright).

### Paquets Noyaux (`packages/`)
- `ui` : Système de design partagé et composants Shadcn/Makerkit.
- `supabase` : Clients typés et utilitaires d'accès aux données.
- `features` : Logique métier transverse (permissions, rôles, RBAC).
- `i18n` : Framework de traduction multi-langue (Support FR/EN).
- `next` : Middlewares et utilitaires d'infrastructure Next.js.
- `shared` : Contrat d'interface (Types TypeScript) et utilitaires génériques.

## 📂 Organisation Fonctionnelle (Web App)

L'application `web` suit les patterns modernes du Next.js App Router :
- `app/` : Routes, layouts dynamiques et composants de page.
- `lib/server/` : Actions serveur regroupant la logique métier (Mutation DB, validation, calculs de slots).
- `config/` : Configuration système (i18n, flags, metadata).
- `supabase/` : Gouvernance de la base de données (Migrations SQL).

## 🚀 Fonctionnalités Stratégiques
1. **Multi-Tenancy (Accounts)** : Isolation totale des données par établissement ou groupe.
2. **Gestion Dynamique des Services** : Planification flexible (Déjeuner, Dîner, Brunch) avec créneaux horaires configurables.
3. **Optimisation des Tables** : Gestion de l'inventaire physique et de la capacité d'accueil.
4. **Dashboard Temps Réel** : Interface administrative auto-actualisée lors de nouvelles réservations via Supabase Realtime.
5. **Permissions Granulaires (RBAC)** : Gestion multi-utilisateurs avec rôles spécifiques (`owner`, `admin`, `member`).
6. **Géolocalisation & Cartographie** : Support natif des coordonnées GPS (lat/lng) pour l'affichage cartographique des établissements.

---
*Dernière mise à jour : 26 Mars 2026*
