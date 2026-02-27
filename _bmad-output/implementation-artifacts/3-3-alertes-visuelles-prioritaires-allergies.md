# Story 3.3 : Alertes Visuelles Prioritaires (Allergies)

## Status
- **Status**: review
- **Epic**: Epic 3 - Dashboard de Gestion "Live"

## Objective
**As a** restaurateur (Thomas),
**I want** que les réservations comportant des notes de sécurité (allergies) soient mises en évidence,
**So that** garantir la sécurité de mes clients.

## Acceptance Criteria
- [x] Un indicateur visuel prioritaire (ex: icône d'alerte rouge, badge "Allergies") est visible immédiatement pour les réservations concernées.
- [x] La détection de l'allergie se base sur la présence de notes spécifiques.
- [x] Les notes sont affichées de manière lisible pour le restaurateur.
- [x] (Architecture) Les notes sont déchiffrées si elles sont chiffrées en base.

## Implementation Plan
1. **Detection Logic**: 
    - [x] Implement a helper to check if `notes` contains keywords like "allergie", "intolérance", "gluten", "arachide", etc.
2. **UI Updates (ReservationsList)**:
    - [x] Add an alert icon or a specific badge next to the client name or in a dedicated column if allergies are detected.
    - [x] Improve the display of notes (perhaps a tooltip or a small text below the name).
3. **Backend Logic (Encryption/Decryption)**:
    - [x] Created `apps/web/lib/security/encryption.ts` for AES-256-CBC encryption.
    - [x] Update `createReservationAction` to encrypt notes.
    - [x] Update `getDailyReservationsAction` to handle decryption.

## File List
- `apps/web/app/home/_components/reservations-list.tsx`
- `apps/web/lib/server/restaurant/restaurant-actions.ts`
