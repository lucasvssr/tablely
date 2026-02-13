# Story 1.1: Initialisation du Projet & Boilerplate

Status: done

## Story

As a développeur,
I want initialiser le projet avec le template MakerKit Lite,
so that disposer des fondations SaaS (Auth, Organisations, UI) immédiatement.

## Acceptance Criteria

1. **Given** un environnement vide
2. **When** j'exécute la commande `npx -y degit makerkit/nextjs-supabase-saas-kit ./`
3. **Then** la structure de dossiers définie dans l'architecture est présente
4. **And** le projet compile sans erreur avec `npm run dev`.

## Tasks / Subtasks

- [x] Initialisation du projet (AC: 1, 2, 3)
  - [x] Exécuter `npx -y degit makerkit/nextjs-saas-starter-kit-lite ./`
  - [x] Vérifier la structure des dossiers (apps/web/app, apps/web/components, apps/web/lib, apps/web/supabase)
- [x] Installation des dépendances (AC: 4)
  - [x] Exécuter `pnpm install` (après activation de corepack)
- [x] Validation de la compilation (AC: 4)
  - [x] Exécuter `pnpm run dev` et vérifier l'absence d'erreurs fatales

## Dev Notes

- **Architecture Pattern:** Utilisation du starter kit MakerKit Lite pour Next.js + Supabase.
- **Constraints:** Respecter la structure de dossiers définie dans `architecture.md`.
- **Naming Conventions:** Frontend components en `PascalCase`, routes et utilitaires en `kebab-case`.

### Project Structure Notes

- Le template MakerKit impose une structure de base (src/app, src/lib) qui doit être alignée avec les futurs développements.
- Les migrations Supabase initiales seront fournies par le template.

### References

- [Source: architecture.md#Starter Template Evaluation]
- [Source: epics.md#Story 1.1]

## Dev Agent Record

### Agent Model Used

Antigravity (GPT-4o)

### Debug Log References

### Completion Notes List

- Projet initialisé avec `makerkit/nextjs-saas-starter-kit-lite` (Structure Monorepo Turbo).
- Dépendances installées avec `pnpm` via `corepack enable`.
- Compilation validée avec `pnpm run dev` (Ready en 7.3s).

### File List

- apps/web/app/*
- apps/web/components/*
- apps/web/lib/*
- apps/web/supabase/*
- package.json
- pnpm-lock.yaml
- pnpm-workspace.yaml
- turbo.json
