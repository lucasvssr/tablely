# Story 1.4 : Gestion d'équipe (Staff & Roles)

**As a** Restaurateur (Thomas),
**I want to** inviter mon équipe (serveurs, managers) sur la plateforme et leur assigner des rôles précis,
**So that** ils puissent consulter ou gérer les réservations sans avoir les droits d'administration complets.

## Acceptance Criteria
- [x] Accès à une interface de gestion des membres de l'organisation.
- [x] Possibilité d'inviter un membre par email.
- [x] Gestion des rôles (Owner, Admin, Member) cohérente avec les besoins du restaurant.
- [x] Les politiques RLS sur les tables `services`, `dining_tables` et `restaurants` sont mises à jour pour inclure les permissions des membres.
- [x] Interface de gestion des invitations (envoyées, en attente).

## Dev Agent Record
- **Internationalization**: Fully implemented French (`fr`) and English (`en`) translations for all team-related UI components (`MembersList`, `InvitationsList`, `InviteMemberForm`, `TeamSettingsPage`).
- **UX Improvements**: 
    - Replaced native `confirm()` dialogs with customized `AlertDialog` components.
    - Improved page load performance by pre-fetching team data on the server (RSC).
    - Replaced `window.location.reload()` with efficient `router.refresh()` for smoother state updates.
- **Database & Security**:
    - Created missing `invitations` table with full RLS support.
    - Enhanced RLS policies for `organizations`, `restaurants`, `services`, and `dining_tables` to support staff (members) and admin roles.
- **Type Safety**: Defined proper interfaces for `Member` and `Invitation` data.

## File List
- `apps/web/app/home/settings/team/page.tsx`: Main team settings page (RSC).
- `apps/web/app/home/settings/team/_components/members-list.tsx`: Component for managing active members.
- `apps/web/app/home/settings/team/_components/invitations-list.tsx`: Component for managing pending invitations.
- `apps/web/app/home/settings/team/_components/invite-member-form.tsx`: Form for inviting new members.
- `apps/web/public/locales/fr/teams.json`: French translations for team management.
- `apps/web/public/locales/en/teams.json`: Cleaned up English translations.
- `apps/web/supabase/migrations/20260220101000_bmad_invitations.sql`: Schema and RLS for invitations.
- `apps/web/supabase/migrations/20260220110000_bmad_rls_completion.sql`: Finalized RLS for staff/admin permissions.

## Implementation Plan
1. **Members Management Interface**:
    - [x] Interface implemented in `/settings/team`.
    - [x] Tabbed view for members and invitations.
2. **Roles Definition**:
    - [x] standard roles used: `owner`, `admin`, `member`.
3. **RLS Policies Update**:
    - [x] updated policies to allow `member` read access and `admin` manage access.
4. **Navigation**:
    - [x] Link present in settings sidebar.
