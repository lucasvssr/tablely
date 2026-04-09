# 🧪 Tests Unitaires — Tablely

Ce répertoire contient les tests unitaires pour les composants logiques critiques de la plateforme **Tablely**. Ils s'exécutent en isolation totale (sans base de données, sans UI) afin de garantir une exécution rapide et des résultats stables.

> **Runner** : [Playwright Test](https://playwright.dev/docs/test-intro) (mode `test:unit` sans navigateur)

---

## 🚀 Exécution

```bash
# Depuis la racine du monorepo
pnpm --filter web-e2e test:unit

# Depuis apps/e2e
pnpm run test:unit
```

Les 60 tests passent en ~10 secondes (7 workers parallèles).

---

## 📋 Couverture par Domaine

### 1. 🔐 Sécurité & Cryptographie

| Fichier | Ce qui est testé |
| :--- | :--- |
| `encryption.spec.ts` | Chiffrement AES-256-GCM (chiffrer/déchiffrer) • Compatibilité avec le format CBC hérité • Gestion des données corrompues |
| `captcha.spec.ts` | Vérification du token Cloudflare Turnstile • Simulation des requêtes réseau (`fetch` mocké) • Comportement sans clé secrète configurée |
| `mfa.spec.ts` | Logique de vérification Multi-Factor Authentication (TOTP) • Cas d'erreur et de succès |

---

### 2. ✅ Schémas de Validation (Zod)

Nous validons que toutes les entrées critiques respectent les contraintes définies dans les schémas.

| Fichier | Domaine |
| :--- | :--- |
| `auth-schemas.spec.ts` | Inscription, longueur du mot de passe, format email |
| `account-schemas.spec.ts` | Mise à jour de l'email et du mot de passe utilisateur |
| `restaurant-schemas.spec.ts` | Format HH:MM des services, capacité des tables (min 1), nombre de convives pour les réservations, jours de semaine (1–7) |

---

### 3. 🧠 Logique Métier

| Fichier | Ce qui est testé |
| :--- | :--- |
| `restaurant-logic.spec.ts` | `slugify` — Génération d'URL : accents, caractères spéciaux, espaces multiples, chaînes vides |
| `shared-utils.spec.ts` | `formatCurrency` (multi-locale : FR, EN) • `isBrowser` (détection d'environnement) • `formatAddress` (formatage d'objets adresse Nominatim / OpenStreetMap) |
| `mailbox.spec.ts` | Parsing HTML d'emails • Extraction de magic-links • Gestion des cas sans lien dans l'email |

---

### 4. 🏗️ Infrastructure & Packages Partagés

| Fichier | Ce qui est testé |
| :--- | :--- |
| `next-utils.spec.ts` | `zodParseFactory` — Mécanisme centralisé de parsing Zod utilisé dans les Server Actions |
| `i18n-utils.spec.ts` | `createI18nSettings` — Génération des paramètres de localisation (FR/EN) |
| `require-user.spec.ts` | `requireUser` — Logique de redirection d'authentification • Vérification des exigences MFA |
| `auth-po.spec.ts` | Page Objects utilitaires pour l'authentification |

---

### 5. 🗺️ SEO & Sitemap

| Fichier | Ce qui est testé |
| :--- | :--- |
| `sitemap.spec.ts` | Génération du sitemap XML • Validation des URLs dynamiques des restaurants • Priorités et fréquences de mise à jour |

---

## ⚙️ Notes Techniques

- **Mocking** : `global.fetch` et `console` sont mockés manuellement pour éviter les dépendances externes et garder la sortie propre.
- **Variables d'environnement** : Certains tests nécessitent des variables (ex: `ENCRYPTION_SECRET`). Elles sont définies dans les blocs `test.beforeAll` — aucune configuration `.env` externe n'est nécessaire.
- **Architecture** : La logique précédemment difficile à tester (ex: `slugify`) a été extraite dans `@kit/shared/utils` pour permettre des tests unitaires propres, sans contraintes `server-only`.
- **Isolation** : Les tests n'ont aucune dépendance sur Supabase, Next.js ou le DOM — ils testent uniquement la logique pure.
