# Story 1.2: Configuration du Restaurant (Wizard d'Onboarding)

Status: ready-for-dev

## Story

As a restaurateur (Thomas),
I want saisir le nom, la localisation et la capacité de mon établissement,
so that commencer à recevoir des réservations.

## Acceptance Criteria

1. **Given** un compte Thomas nouvellement créé (via le boilerplate)
2. **When** Thomas accède au wizard d'onboarding/création d'organisation
3. **Then** il peut saisir le **Nom**, la **Localisation** et la **Capacité Totale** (seats)
4. **And** une nouvelle organisation est créée dans Supabase avec ces attributs
5. **And** un UUID unique (NFR5) est généré pour identifier cet établissement
6. **And** les données sont persistées dans une table `restaurants` (ou extension de `organizations`) avec RLS activé.

## Tasks / Subtasks

- [ ] Schéma de base de données (AC: 4, 5, 6)
  - [ ] Créer une migration Supabase pour la table `restaurants` liée à `organizations`
  - [ ] Ajouter les colonnes : `id` (UUID), `organization_id` (FK), `name`, `location`, `total_capacity`, `created_at`
  - [ ] Configurer les politiques RLS (Row Level Security) pour isoler les données par `organization_id`
- [ ] UI de l'Onboarding (AC: 1, 2, 3)
  - [ ] Créer/Adapter la page d'onboarding (ex: `/onboarding` ou adaptation du flow MakerKit)
  - [ ] Implémenter le formulaire avec Validation Zod (Nom, Localisation, Capacité)
- [ ] Logique Backend (AC: 4)
  - [ ] Créer une Server Action `createRestaurantAction` pour persister les données
  - [ ] Lier dynamiquement le restaurant à l'organisation de l'utilisateur actuel

## Dev Notes

- **Architecture Pattern:** MakerKit utilise les "Organizations" pour le multi-tenancy. La table `restaurants` doit être liée 1:1 à une organisation.
- **Security:** RLS obligatoire. L'utilisateur doit être membre de l'organisation pour lire/écrire dans `restaurants`.
- **UI:** Utiliser Shadcn/UI (Form, Input, Button) pour une expérience premium.
- **Constraints:** Suivre `kebab-case` pour les fichiers et `PascalCase` pour les composants.

### Project Structure Notes

- Localisation suggérée : `apps/web/app/onboarding` (à créer si absente) ou intégration dans le flow `home`.
- Actions : `apps/web/lib/actions/restaurant.actions.ts`.
- Types : `apps/web/types/restaurant.ts`.

### References

- [Source: planning-artifacts/architecture.md#Data Architecture]
- [Source: planning-artifacts/epics.md#Story 1.2]
- [Source: planning-artifacts/prd.md#FR11]

## Dev Agent Record

### Agent Model Used

Antigravity (GPT-4o)

### Debug Log References

### Completion Notes List

### File List
