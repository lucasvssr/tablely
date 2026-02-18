# Story 1.3: Définition des Services (Midi/Soir) & Gestion des Tables

Status: in-progress

## Story
As a restaurateur (Thomas),
I want définir mes plages horaires et configurer mon plan de salle (tables),
So that le système puisse valider la disponibilité réelle pour chaque groupe.

## Acceptance Criteria
- [x] Création/Migration des tables `services` et `dining_tables` dans Supabase.
- [x] Interface pour ajouter/modifier des services (Nom, Heure début, Heure fin).
- [x] Interface pour déclarer les tables (Nom/Numéro, Capacité).
- [x] Validation RLS : Seul le staff du restaurant peut voir/modifier ces paramètres.
- [x] Logique : La capacité totale du restaurant est dérivée de la somme des capacités des tables actives.

## Implementation Plan
1. **Database Migration**:
   - `services`: `id`, `organization_id`, `name`, `start_time`, `end_time`, `days_of_week`.
   - `dining_tables`: `id`, `organization_id`, `name`, `capacity`, `is_active`.
2. **Server Actions**:
   - `upsertServiceAction`: Pour gérer les périodes de service.
   - `upsertTableAction`: Pour gérer le parc de tables.
3. **UI Components**:
   - Page de configuration des services.
   - Page de gestion des tables.

## Developer Notes
- **Table-based logic**: Suite au feedback utilisateur, nous passons d'une simple "capacité totale" à une gestion granulaire par table.
- **Multitenancy**: Toujours utiliser `organization_id` pour isoler les données.
