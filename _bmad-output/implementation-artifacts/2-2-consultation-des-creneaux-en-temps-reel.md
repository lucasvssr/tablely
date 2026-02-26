# Story 2.2: Consultation des Créneaux en Temps Réel

## Title
Consultation des Créneaux en Temps Réel

## Status
In Progress

## Persona
Julie (Cliente)

## Requirement
As a cliente (Julie),
I want voir instantanément les créneaux horaires disponibles pour le nombre de couverts souhaité,
So that ne pas perdre de temps à appeler.

## Acceptance Criteria
- [ ] Le sélecteur de date et de couverts est présent sur la page restaurant.
- [ ] Lorsqu'un critère (date ou couverts) change, les créneaux horaires ("slots") disponibles sont mis à jour.
- [ ] Seuls les créneaux ayant une capacité suffisante sont affichés.
- [ ] L'affichage se met à jour en moins de 500ms (Supabase Realtime).
- [ ] Les créneaux sont regroupés par service (ex: Midi / Soir).

## Technical Tasks
- [ ] Créer la migration pour la table `reservations` (si absente).
- [ ] Implémenter une fonction ou vue pour calculer la disponibilité des slots.
- [ ] Créer le composant `BookingCalendar` pour la sélection de date.
- [ ] Créer le composant `GuestSelector` pour le nombre de couverts.
- [ ] Créer le composant `SlotPicker` pour afficher les créneaux.
- [ ] Intégrer les composants dans la page `/restaurant/[slug]/page.tsx`.
- [ ] Mettre en place l'abonnement Supabase Realtime pour refléter les changements de capacité.
