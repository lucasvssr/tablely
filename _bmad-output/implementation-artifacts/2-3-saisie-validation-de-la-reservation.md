# Story 2.3: Saisie et validation de la réservation

## Description
En tant que client, je souhaite pouvoir saisir mes coordonnées (nom, email, téléphone) et valider ma réservation afin de recevoir une confirmation.

## Acceptance Criteria
- [x] Formulaire de saisie des coordonnées client (Nom, Email, Téléphone, Notes).
- [x] Validation des champs : Email obligatoire et valide, Téléphone optionnel mais formaté.
- [x] Action de validation (Server Action) pour enregistrer la réservation en base de données.
- [x] Attribution automatique d'une table disponible (si possible) ou enregistrement global.
- [x] Message de succès (Confirmation) après validation.
- [x] Mise à jour en temps réel des créneaux pour les autres utilisateurs (déjà amorcé en 2.2).

## Technical Details
- Utiliser un nouveau composant `BookingForm` ou intégrer dans `BookingContainer`.
- Créer une Server Action `createReservationAction`.
- Gérer les états de chargement et les erreurs.
- Utiliser `Zod` pour la validation côté serveur et client.
