# Story 3.1: Vue Centralisée des Réservations du Jour

**As a** Restaurateur (Thomas),
**I want to** voir la liste complète des réservations prévues pour aujourd'hui sur mon tableau de bord,
**So that** je puisse préparer mon service et l'accueil des clients avec une vision claire.

## Acceptance Criteria
- [x] Interface du tableau de bord restaurateur mise à jour pour afficher la liste des réservations du jour.
- [x] Les réservations affichent le nom du client, l'heure, le nombre de couverts et le statut.
- [x] La liste se met à jour instantanément (Supabase Realtime) lors de nouvelles réservations ou modifications.
- [x] Filtrage par défaut sur la date du jour (aujourd'hui).
- [x] Navigation possible pour voir les réservations des jours précédents/suivants (optionnel mais recommandé).

## Dev Agent Record
### Implementation Plan
- **Backend**: Implement Server Action `getDailyReservationsAction` in `restaurant-actions.ts`. [DONE]
- **UI**: Create `ReservationsList` and `ReservationRow` components. [DONE]
- **Realtime**: Hook up `useBookingRealtime` (or similar) to the reservations table. [DONE]
- **Main Page**: Update `apps/web/app/home/page.tsx` with the new components. [DONE]

## Implementation Plan
1. **Server-side Data Retrieval**:
    - [x] Create `getDailyReservationsAction` in `~/lib/server/restaurant/restaurant-actions.ts`.
    - [x] This action should filter by `account_id` and the specified `date` (defaulting to today).
2. **Dashboard UI Refactoring**:
    - [x] Create `ReservationsList.tsx` in `apps/web/app/home/_components`.
    - [x] Use `shadcn/ui` table to display: Time, Client Name, Guests, Status.
    - [x] Add loading and empty states ("Aucune réservation pour ce jour").
3. **Real-time Synchronization**:
    - [x] Implement `useReservationsRealtime` hook (or integrate logic in `ReservationsList`).
    - [x] Subscribe to `reservations` table changes for the current `account_id`.
4. **Integration**:
    - [x] Replace the current `DashboardDemo` in `apps/web/app/home/page.tsx` with the new live view.
    - [x] Add a date picker or simple "Prev/Next Day" navigation.

## File List
- `apps/web/app/home/page.tsx`
- `apps/web/app/home/_components/reservations-list.tsx`
- `apps/web/lib/server/restaurant/restaurant-actions.ts`

## Status
- **Status**: done
