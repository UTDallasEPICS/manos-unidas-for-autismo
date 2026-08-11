# UI Conventions

How the front end is built. Follow these so the app stays consistent — the
foundation is deliberately opinionated so features look the same no matter who
writes them.

## Stack

- **Nuxt 4** (Vue 3, `<script setup lang="ts">`, Composition API)
- **Nuxt UI v4** (`@nuxt/ui`) — the full component set (dashboard, tables,
  forms, modals). **Use these components; do not hand-roll.**
- **Tailwind CSS v4** — utility classes + semantic tokens (below)
- **@nuxt/fonts** — Inter, self-hosted (no external CDN)
- **@nuxtjs/i18n** — see [I18N.md](./I18N.md)

## Theme

Defined in `assets/css/main.css` and `app.config.ts`.

- **Primary** is the FMUA "midnight" navy ramp. `app.config.ts` aliases
  `colors.primary: "midnight"`; the ramp lives in `main.css`.
- ⚠️ The ramp MUST be declared in **`@theme static { … }`**, not plain
  `@theme`. Tailwind v4 tree-shakes unused theme vars, and NuxtUI references the
  shades indirectly — plain `@theme` drops them and every `bg-primary` element
  renders transparent (invisible buttons). `static` forces them to emit.
- **Neutral** is `slate` (drives all gray surfaces/text + light/dark coherence).
- **Dark mode** works out of the box via `UColorModeButton`. Never hardcode
  colors — use the semantic tokens below so both modes stay correct.
- **Solid buttons brighten on hover** (`app.config.ts` button override) instead
  of the default wash-out.

### Semantic tokens (use these, not raw colors)

| Purpose            | Token                                            |
| ------------------ | ------------------------------------------------ |
| Headings / strong  | `text-highlighted`                               |
| Body text          | `text-default`                                   |
| Secondary text     | `text-muted`                                     |
| Faint / disabled   | `text-dimmed`                                    |
| Surfaces           | `bg-default` / `bg-elevated` / `bg-muted`        |
| Borders / dividers | `border-default` / `divide-default`              |
| Status             | `text-error` / `text-success` / `text-warning`   |
| Inverted (on dark) | `bg-inverted` / `text-inverted`                  |

NuxtUI components take a `color` prop: `primary | neutral | error | warning | success | info`.
Icons are Iconify names: `icon="i-lucide-…"` (search at https://icones.js.org).

### Do NOT use (legacy — being removed)

`.btn`, `.input`, `.bg-blay`, `.bg-smoky`, `font-cormorant-garamond`,
`font-sc-encode`, `font-karla`, raw `<select>/<input>/<textarea>`, custom
`fixed inset-0 bg-black/…` overlay modals, `lucide-vue-next` icons, hardcoded
hex colors. Replace with the NuxtUI equivalent + a semantic token.

## Layouts

- **`layouts/default.vue`** — the authenticated app shell: collapsible sidebar
  (`UDashboardSidebar`) + main panel. Nav links come from `useUserLinks()` (role
  logic) with presentation (icon + i18n label) in `NAV_META`. Every logged-in
  page renders in this automatically.
- **`layouts/auth.vue`** — bare shell for public pages (landing/login, contact,
  request form). Set with `definePageMeta({ layout: "auth" })`.

## Canonical patterns — copy these

Every UI shape has a reference implementation. When building something new, copy
the closest one instead of inventing a layout.

| Need                         | Reference file                                   |
| ---------------------------- | ------------------------------------------------ |
| Page + loading/empty/error   | `pages/parent/children.vue`                      |
| Data table                   | `pages/patient/viewContactForms.vue` (UTable)    |
| Static form                  | `components/profile/EditModal.vue` (UForm fields)|
| Modal                        | `components/schedule/SessionDetailModal.vue`     |
| Read-only detail view        | `components/therapy/PatientModal.vue` (`<dl>`)    |
| Dashboard tile grid          | `components/DashboardTiles.vue` (UPageGrid)      |
| Public form + Zod            | `pages/patient/contactForm.vue`                  |

### Page shell

Wrap page content in a centered, max-width container:

```vue
<template>
  <div class="mx-auto w-full max-w-5xl">
    <h1 class="text-highlighted mb-6 text-xl font-semibold">{{ t("…") }}</h1>
    …
  </div>
</template>
```

### Loading / empty / error (async data)

```vue
<UAlert v-if="error" color="error" variant="subtle" icon="i-lucide-triangle-alert"
  :title="t('common.loadError')" />
<div v-else-if="!rows.length && status !== 'pending'"
  class="border-default text-muted rounded-lg border border-dashed py-12 text-center">
  {{ t('…empty') }}
</div>
<UTable v-else :data="rows" :columns="columns" :loading="status === 'pending'" />
```

### Table (`UTable`)

Columns are `TableColumn<Row>[]` with `{ accessorKey, header }`. Custom cells use
the `#<accessorKey>-cell` slot:

```vue
<template #actions-cell="{ row }">
  <UButton size="xs" :to="localePath(`/request/${row.original.id}`)" … />
</template>
```

### Modal (`UModal`)

Self-manage `open`, expose `#body` / `#footer`:

```vue
<UModal v-model:open="open" :title="t('…')">
  <template #body>…</template>
  <template #footer>
    <div class="flex w-full justify-end gap-3">
      <UButton color="neutral" variant="outline" :label="t('…cancel')" @click="open = false" />
      <UButton :label="t('…save')" @click="submit" />
    </div>
  </template>
</UModal>
```

## Auth in the client

- `useAuthState()` → `{ user, userId, access, refresh }`. `access` is the
  resolved permission map (UX only — real auth is server-side).
- `useAccess().can('ADMIN')` for role checks in templates.
- Route gating: `types/permissions.ts` `pageAccessMap` (route name → one
  `AccessPermission`) drives the global UX guard. Server endpoints must be
  `defineAuthedHandler` + ownership-gated regardless.

## Diagnostics

`/dev` (ADMIN/IT only) lists every route with its required permission + whether
you can reach it, shows build/session info, and audits `pageAccessMap` for
ungated/stale entries. Use it when adding routes.
