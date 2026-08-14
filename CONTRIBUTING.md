# Contributing

Welcome. This is a therapy-management app for **Fundación Manos Unidas por
Autismo** (a Dominican Republic autism center). Read the two convention docs
before writing UI:

- [`docs/UI.md`](./docs/UI.md) — NuxtUI v4 components, theme, canonical patterns
- [`docs/I18N.md`](./docs/I18N.md) — everything must be translated (EN/ES)

## Local setup

```bash
pnpm install
cp .env.example .env          # then fill in the values (see below)
pnpm exec prisma migrate deploy   # apply migrations to the SQLite dev DB
pnpm exec prisma db seed          # seed roles + sample data
pnpm dev                          # → http://localhost:3000
```

`.env` essentials:

- `DATABASE_URL="file:dev.db"` — local SQLite
- `BETTER_AUTH_SECRET` — any random string for local
- `BETTER_AUTH_URL="http://localhost:3000"` — **must match the port you run on**
- SMTP\_\* — only needed to actually send email; in dev, codes print to the
  console instead (see below)

### Signing in (email OTP)

Auth is passwordless (email one-time code). **In development the code is printed
to the dev-server console**, not emailed:

```
[DEV] OTP for admin@email.com (sign-in): 123456
```

Seed logins (all use OTP, all `@email.com`): `admin`, `user-service`,
`it-service`, `therapist`, `evaluator`, `parent`, `patient`.

### Running on a different port

Nothing hardcodes the port. Set `PORT` and match `BETTER_AUTH_URL`:

```bash
PORT=3001 pnpm dev            # and set BETTER_AUTH_URL="http://localhost:3001"
```

The auth **client** has no fixed base URL — it uses the current origin — so only
the server-side `BETTER_AUTH_URL` needs updating.

## Workflow

- **Branch off `dev`** (never commit to `dev`/`main`/`stage` directly).
- Keep PRs **small and focused** (one feature/cluster). Open a PR into `dev`.
- A maintainer reviews before merge; PRs squash-merge into `dev`.
- Commit messages: `type(scope): summary` (e.g. `feat(ui): …`, `fix(schedule): …`).

## Checks (run before pushing)

The **pre-commit hook** runs automatically; you can run the same suite manually:

```bash
npm run checker
```

It runs, and all must pass:

1. **`check-endpoint-auth`** — every `server/api/**` endpoint must be wrapped in
   `defineAuthedHandler` (deny-by-default). See the auth invariant below.
2. **`i18n:check`** — EN/ES parity + no hardcoded strings (see `docs/I18N.md`).
3. **eslint** — note: put `definePageMeta()` **after** imports; templates need a
   single root element.
4. **prettier** — formatting (it reorders Tailwind classes; re-read a file
   after formatting before editing it again).

## Non-negotiables

- **Server authorization is deny-by-default.** Every API endpoint is
  `defineAuthedHandler` with a role/ownership check. Client-side `pageAccessMap`
  gating is UX only — never the security boundary. IT staff are excluded from
  PHI. Don't loosen this.
- **Everything is translated.** No hardcoded user-facing strings (`docs/I18N.md`).
- **Use NuxtUI components + semantic tokens** — no legacy `.btn/.input/.bg-*`
  helpers, no raw HTML modals (`docs/UI.md`).

## Handy

- **`/dev`** (ADMIN/IT only) — route map, access-model audit, env/build info.
- Requirements reference: [`docs/REQUIREMENTS.md`](./docs/REQUIREMENTS.md)
  (some sections predate the UI redesign — trust the code + `docs/UI.md`/`I18N.md`
  for current conventions).
