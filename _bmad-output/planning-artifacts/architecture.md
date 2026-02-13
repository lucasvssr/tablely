---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments: ['product-brief-Bmad-2026-02-06.md', 'prd.md']
workflowType: 'architecture'
project_name: 'Bmad'
user_name: 'L.vasseur'
date: '2026-02-11T16:21:00'
lastStep: 8
status: 'complete'
completedAt: '2026-02-11T16:35:00'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
Le système repose sur un moteur de réservation temps réel (Supabase) synchronisé avec un dashboard restaurateur. L'architecture doit supporter la gestion dynamique des services (Midi/Soir) et des fermetures (Blackout), ainsi qu'une logique d'attente digitale.

**Non-Functional Requirements:**
- **Performance :** Latence critique (API < 300ms, Real-time < 500ms).
- **Sécurité :** Étanchéité Multi-tenancy via RLS obligatoire.
- **Résilience :** Cache local pour usage en salle et robustesse face aux services tiers.

**Scale & Complexity:**
- Primary domain: SaaS B2B / Web Real-time
- Complexity level: Medium-High
- Estimated architectural components: ~10-12 modules (Auth, Booking, Dashboard, Notification, Settings, Billing, WaitingList, etc.)

### Technical Constraints & Dependencies
- Framework: Next.js (App Router)
- Backend/DB: Supabase (PostgreSQL + Realtime)
- Emails: Resend
- Billing/Penalties: Stripe

### Cross-Cutting Concerns Identified
- **Multitenancy :** Filtrage systématique par `restaurant_id`.
- **State Consistency :** Gestion des conflits de réservation en temps réel.
- **Auditability :** Journalisation des accès aux données clients sensibles.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack SaaS (Next.js + Supabase) basé sur l'analyse des besoins de multi-tenancy et de temps réel.

### Starter Options Considered

- **MakerKit Next.js Supabase SaaS Kit (Lite)** : Complet, gère nativement les organisations et le RBAC. Recommandé pour B2B.
- **Official Supabase Next.js Auth Template** : Too minimal for a complex multi-tenant SaaS.

### Selected Starter: MakerKit Next.js Supabase SaaS Starter Kit (Lite)

**Rationale for Selection:**
Ce template fournit une base "SaaS-ready" qui adresse directement les contraintes critiques de Bmad : l'isolation des données par restaurant et une interface professionnelle évolutive. L'utilisation de Next.js 15 (App Router) et Tailwind assure une pérennité technique et esthétique.

**Initialization Command:**

```bash
npx -y degit makerkit/nextjs-supabase-saas-kit ./
```

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript strict avec configuration Next.js 15+ App Router.
- **Multi-tenancy:** Logique d'Organisations intégrée au niveau du schéma et du routing.
- **Styling Solution:** Tailwind CSS couplé à Shadcn/UI pour des composants accessibles et premium.
- **Auth Patterns:** Authentification par cookies via Supabase Auth (SSR safe).
- **Project Structure:** Séparation claire entre les routes publiques (Marketing/Réservation) et privées (Dashboard Thomas).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- **Data Model :** Approche "Slot-based". La disponibilité est calculée par des créneaux pré-générés pour garantir une performance maximale lors de la réservation et éviter les sur-réservations.
- **Security :** Chiffrement AES-256 obligatoire pour les notes sensibles (allergies) avant stockage en base de données.

**Important Decisions (Shape Architecture):**
- **Real-time :** Utilisation de Supabase Realtime v2.75+ (Channels) pour la synchronisation immédiate entre les clients et le dashboard Thomas.
- **Multitenancy :** Isolation stricte via Row Level Security (RLS) basée sur l'identifiant d'organisation (fourni par MakerKit).

### Data Architecture
- **Database :** PostgreSQL 17 (via Supabase).
- **Slot Management :** Utilisation de fonctions PL/pgSQL pour la génération automatique de créneaux basés sur les horaires de service et la configuration des tables.

### Authentication & Security
- **Auth :** Cookie-based Auth via Supabase, configuré pour le Server-Side Rendering (SSR).
- **Encryption :** Utilisation de l'extension `pgsodium` ou d'une logique de cryptage côté serveur pour les champs `sensitive_notes`.

### API & Communication Patterns
- **API Design :** Next.js Server Actions pour les mutations et Server Components pour le rendering de données.
- **Real-time :** Abonnements ciblés par organisation pour minimiser la charge réseau.

### Decision Impact Analysis
- **Implementation Sequence :** 
  1. Setup du Boilerplate (MakerKit)
  2. Schéma DB & RLS
  3. Moteur de calcul des Slots
  4. Intégration Realtime du Dashboard.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **DB Tables :** `snake_case` pluriel (ex: `restaurants`, `bookings`).
- **DB Columns :** `snake_case` (ex: `restaurant_id`, `is_active`).
- **Frontend Components :** `PascalCase` (ex: `SlotPicker.tsx`).
- **Files/Folders :** `kebab-case` pour les routes et utilitaires.

### Structure Patterns
- **Components :** Organisation par feature dans `/components/[feature]`.
- **Server Actions :** Groupés par domaine dans `/lib/actions`.
- **Database Logic :** Fonctions complexes et triggers stockés dans `/supabase/migrations`.

### Format Patterns
- **API Standards :** Format `{ data, error }` pour toutes les promesses asynchrones.
- **Dates :** Full ISO strings (UTC) côté Backend, formatage local côté Client uniquement.

### Process Patterns
- **Real-time :** Toujours déconnecter les channels Supabase dans le cleanup du `useEffect`.
- **Multi-tenancy :** Obligation d'inclure `restaurant_id` dans chaque requête SQL (vérifié par RLS).

## Project Structure & Boundaries

### Complete Project Directory Structure

```text
bmad-reservation/
├── src/
│   ├── app/
│   │   ├── (public)/                 # Pages accessibles à Julie (Réservation)
│   │   │   ├── booking/
│   │   │   │   └── [id]/              # Flow de réservation par restaurant
│   │   ├── (dashboard)/              # Pages privées de Thomas
│   │   │   └── dashboard/
│   │   │       ├── bookings/          # Liste et calendrier temps réel
│   │   │       ├── slots/             # Configuration des services
│   │   │       └── settings/          # Blackout dates, etc.
│   ├── components/
│   │   ├── booking/                  # ComposantsJulie (SlotPicker, GuestForm)
│   │   ├── dashboard/                # Composants Thomas (Calendar, AlertCard)
│   │   └── ui/                       # Shadcn/UI (boutons, inputs premium)
│   ├── lib/
│   │   ├── actions/                  # Next.js Server Actions (createBooking, updateSlot)
│   │   ├── hooks/                    # useRealtimeBookings, useSlots
│   │   ├── security/                 # aes-encryption.ts (données sensibles)
│   │   └── supabase/                 # supabase-client.ts, middleware.ts
│   └── types/                        # database.types.ts, booking.ts
├── supabase/
│   ├── migrations/                   # Migration SQL (tables, RLS, functions)
│   └── seed.sql                      # Données de test (restaurants fictifs)
├── public/                           # Assets (Images, Logos)
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

### Architectural Boundaries

**API Boundaries:**
- Les mutations passent exclusivement par les **Server Actions** (`/src/lib/actions`).
- Les données sensibles ne sont jamais exposées directement par SQL ; elles transitent par une couche de service (`src/lib/security`) qui gère le déchiffrement.

**Component Boundaries:**
- **Feature-driven :** Les composants sont isolés par domaine (`booking/` vs `dashboard/`).
- **UI System :** Tous les composants graphiques de base utilisent le système de design Shadcn/UI pour garantir l'esthétique premium demandée (NFR10).

**Data Boundaries:**
- **RLS :** L'identité de l'utilisateur (via `auth.uid()`) est la seule clé de lecture autorisée.
- **Shared Data :** Les `slots` sont accessibles en lecture seule pour le public, mais en écriture pour l'admin (via les politiques Postgres).

### Requirements to Structure Mapping

- **PRD FR1-FR5 (Julie) :** Implémentés dans `src/app/(public)/booking`.
- **PRD FR6-FR15 (Thomas) :** Implémentés dans `src/app/(dashboard)/dashboard`.
- **PRD FR24 (Allergies) :** Logiciel de chiffrement dans `src/lib/security`.

## Architecture Validation Results

### Coherence Validation ✅
Les décisions technologiques (Next.js/Supabase/Stripe) forment un écosystème SaaS mature. La structure App Router et les Server Actions assurent une séparation propre des responsabilités.

### Requirements Coverage Validation ✅
- **Functional :** 100% des FRs sont mappées à des composants ou des actions API spécifiques.
- **Non-Functional :** La performance (Realtime/Slots) et la sécurité (RLS/Encryption) sont au cœur des choix techniques.

### Implementation Readiness Validation ✅
L'architecture est jugée **complète**. Les agents peuvent démarrer par l'initialisation du boilerplate via `degit makerkit/nextjs-supabase-saas-kit`.

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** HIGH

**Key Strengths:**
- Isolation multi-tenante native (MakerKit + RLS).
- Moteur de disponibilité haute performance (Slot-based).
- Sécurité renforcée pour les données sensibles (AES-256).

### Implementation Handoff

**AI Agent Guidelines:**
- Respecter scrupuleusement le nommage en `snake_case` pour la DB et `PascalCase` pour les composants.
- Toute nouvelle table doit posséder une politique RLS basée sur l'identifiant d'organisation.
- Utiliser les Server Actions pour toute mutation de données.
