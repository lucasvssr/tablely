# Story 3.4 : Édition Dynamique en Salle

## Status
- **Status**: done
- **Epic**: Epic 3 - Dashboard de Gestion "Live"

## Objective
**As a** restaurateur (Thomas),
**I want** pouvoir modifier le nombre de couverts ou l'heure d'une réservation existante depuis mon dashboard,
**So that** m'adapter aux imprévus.

## Acceptance Criteria
- [x] Une option "Modifier" est disponible pour chaque réservation dans le dashboard.
- [x] Un formulaire permet de modifier le nombre de couverts et l'heure.
- [x] Le système vérifie la disponibilité avant de valider les changements (recalcul de capacité).
- [x] Les modifications sont mises à jour en temps réel.
- [x] Les notes peuvent également être éditées.

## Implementation Plan
1. **Server Action**:
    - [x] Created `updateReservationDetailsAction` with availability logic.
    - [x] Integrated `encrypt` for notes.
2. **UI Updates (ReservationsList)**:
    - [x] Added "Éditer" option.
    - [x] Created `EditReservationDialog` with Shadcn/UI for a premium feel.
3. **Real-time**:
    - [x] Updates are broadcasted via Supabase Realtime.

## File List
- `apps/web/lib/server/restaurant/restaurant-actions.ts`
- `apps/web/app/home/_components/reservations-list.tsx`
- `apps/web/app/home/_components/edit-reservation-dialog.tsx` (new)
