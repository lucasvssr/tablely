# 📚 Documentation Technique • Tablely

Bienvenue dans le centre de documentation de **Tablely**, la plateforme SaaS de gestion de réservations nouvelle génération pour les restaurateurs. 

Ce portail centralise l'architecture, les spécifications techniques et les guides opérationnels du projet.

---

## 🧭 Navigation Rapide

### 📂 Vue d'Ensemble & Structure
- [**Présentation du Projet**](./project-overview.md) : Vision, objectifs métier et fonctionnalités clés.

### 🏗️ Architecture & Données
- [**Architecture Technique**](./architecture.md) : Patterns de conception (SSR, Server Actions), flux de données et intégrations.
- [**Modèles de Données**](./data-models.md) : Schéma PostgreSQL (Supabase), politiques RLS et fonctions SQL critiques.
- [**Contrats d'Interface (API)**](./api-contracts.md) : Catalogue des Server Actions et routes HTTP.

### 🍱 Composants & Design
- [**Inventaire des Composants**](./component-inventory.md) : Liste des primitives Shadcn UI et composants Makerkit.
- [**Analyse de l'Arborescence**](./source-tree-analysis.md) : Organisation détaillée du Monorepo et des applications.

### 🚀 Guide de Développement
- [**Guide de Démarrage**](./development-guide.md) : Installation des dépendances (PNPM), configuration locale et standards de code.

---

## 🛠️ Stack Technique

Tablely s'appuie sur une stack moderne et performante pour garantir scalabilité et expérience utilisateur fluide.

| Composant | Technologie |
| :--- | :--- |
| **Framework UI** | Next.js 15 (React 19) • App Router |
| **Langage** | TypeScript (Strict mode) |
| **Base de Données** | PostgreSQL (Supabase) |
| **Sécurité** | Row Level Security (RLS) • Supabase Auth |
| **Styling** | Tailwind CSS v4 • Shadcn UI (Radix) |
| **Gestion Monorepo** | Turborepo • PNPM Workspaces |
| **Validation** | Zod • React Hook Form |
| **État & Fetching** | TanStack Query v5 (React Query) |

---

## 📈 État & Maintenance du Projet

- **Version Actuelle** : `0.1.0-alpha.2`
- **Dernière mise à jour** : 6 Mars 2026
- **Environnement** : Déployé sur Vercel (Frontend) et Supabase Cloud (Backend).

---

> [!NOTE]
> Cette documentation est maintenue par l'assistant IA **Antigravity**. Elle est synchronisée avec l'état actuel de la base de code et les évolutions du schéma Supabase.

---
*Tablely © 2026 • Système de gestion de restauration intelligent.*
