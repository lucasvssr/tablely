# @kit/supabase

Ce package gère les clients Supabase typés et les utilitaires d'accès aux données pour toute la plateforme Tablely.

## Clients Disponibles

| Client | Import | Usage |
| :--- | :--- | :--- |
| **Browser** | `@kit/supabase/browser-client` | Composants React côté client (`'use client'`) |
| **Server** | `@kit/supabase/server-client` | Server Components & Server Actions (avec cookies de session) |
| **Server Static** | `@kit/supabase/server-static-client` | Données mises en cache (`unstable_cache`) — évite l'appel dynamique à `cookies()` |
| **Admin** | `@kit/supabase/server-admin-client` | Opérations privilégiées (bypass RLS) — **uniquement côté serveur** |

```ts
// Server Component ou Server Action
import { getSupabaseServerClient } from '@kit/supabase/server-client';
const supabase = getSupabaseServerClient<Database>();

// Bypass RLS (opérations admin)
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';
const adminClient = getSupabaseServerAdminClient<Database>();

// Pour les données cachées (sans cookies)
import { getSupabaseServerStaticClient } from '@kit/supabase/server-static-client';
const supabase = getSupabaseServerStaticClient<Database>();
```

## Utilitaires

| Fichier | Export | Description |
| :--- | :--- | :--- |
| `require-user.ts` | `requireUser` | Valide la session et retourne l'utilisateur, redirige si non authentifié ou MFA requis |
| `check-requires-mfa.ts` | `checkRequiresMfa` | Vérifie si l'utilisateur doit compléter la vérification MFA |
| `auth-callback.service.ts` | `AuthCallbackService` | Gère le flux de callback OAuth/Magic-link Supabase |

## Installation

```json
{
  "dependencies": {
    "@kit/supabase": "*"
  }
}
```