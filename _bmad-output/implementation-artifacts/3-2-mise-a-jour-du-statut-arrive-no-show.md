# Story 3.2: Mise à Jour du Statut (Arrivé / No-show)

**As a** Restaurateur (Thomas),
**I want to** marquer un client comme "Arrivé" ou "No-show" en un clic,
**So that** je puisse suivre l'état de ma salle en temps réel.

## Acceptance Criteria
- [x] Une réservation dans la liste peut être marquée comme "Arrivé" via un bouton d'action.
- [x] Une réservation dans la liste peut être marquée comme "No-show" via un bouton d'action.
- [x] Le statut est immédiatement mis à jour dans la base de données (Supabase).
- [x] L'interface utilisateur reflète le changement de statut immédiatement (via Realtime ou optimisitic UI).
- [x] Les badges de statut sont mis à jour en conséquence.
- [x] **Contrainte Temps** : "Arrivé" possible uniquement à partir de 30 min avant l'heure prévue.
- [x] **Contrainte Temps** : "No-show" possible uniquement à partir de 15 min après l'heure prévue.

## Dev Agent Record
### Implementation Plan
- **Backend**: Implement Server Action `updateReservationStatusAction` in `restaurant-actions.ts`. [DONE]
- **UI**: Update `ReservationsList` to include status update buttons (Arrivé / No-show). [DONE]
- **UX**: Add a dropdown or specific icons for status management in each row. [DONE]

## Implementation Plan
1. **Server-side Logic**:
    - [x] Create `updateReservationStatusAction` in `~/lib/server/restaurant/restaurant-actions.ts`.
    - [x] This action should verify permissions (Admin/Staff of the account) before updating.
2. **UI Updates (ReservationsList)**:
    - [x] Add a "Manage Status" dropdown or direct action buttons to each reservation row.
    - [x] Implement the call to `updateReservationStatusAction`.
    - [x] Ensure the UI handles the loading state during update.
    - [x] Add time-based tooltips and disabling logic for "Arrived" and "No-show".
3. **Validation**:
    - [x] Verify that real-time sync (already implemented in 3.1) correctly refreshes the list for other users when a status changes.

## File List
- `apps/web/app/home/_components/reservations-list.tsx`
- `apps/web/lib/server/restaurant/restaurant-actions.ts`

## Status
- **Status**: review
