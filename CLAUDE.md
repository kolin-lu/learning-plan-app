# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

学习计划工具 (Learning Plan Tool) — an Expo / React Native mobile + web app for managing study plans, tasks, and subtasks. The UI copy is Chinese. The product itself stores all Plan/Task/Subtask data locally via AsyncStorage; the bundled tRPC + Drizzle + MySQL backend is template scaffolding and is **not** currently used by any product feature.

Package manager is **pnpm 9.x** (Node 22.x). The `.npmrc` sets `node-linker=hoisted`.

## Commands

```bash
pnpm dev          # concurrently runs dev:server (tsx watch) + dev:metro (expo start --web)
pnpm dev:server   # backend on port 3000 (auto-picks next free in [3000, 3019])
pnpm dev:metro    # Metro/Expo on port 8081 (override via EXPO_PORT)
pnpm android      # expo start --android
pnpm ios          # expo start --ios

pnpm check        # tsc --noEmit (type-check only)
pnpm lint         # expo lint (eslint-config-expo flat config)
pnpm format       # prettier --write .
pnpm test         # vitest run
pnpm test path/to/file.test.ts        # run a single test file
pnpm test -t "should create a plan"   # filter by test name

pnpm build        # esbuild bundles server/_core/index.ts → dist/ (ESM, node platform)
pnpm start        # node dist/index.js (production server)

pnpm db:push      # drizzle-kit generate && drizzle-kit migrate (needs DATABASE_URL)
pnpm qr           # node scripts/generate_qr.mjs
```

There is no `vitest.config` — Vitest uses defaults and picks up `**/*.test.ts(x)`. The two test locations are `lib/__tests__/` (product code) and `tests/` (template auth — currently `describe.skip`).

## Architecture

### Two stacks in one repo

1. **Client (Expo / React Native, the actual product).** Expo Router file-based routing under `app/`. State lives in a single React Context (`lib/plan-context.tsx`) backed by `AsyncStorage`. There is **no** server round-trip for Plan/Task/Subtask data.
2. **Server (Express + tRPC + Drizzle/MySQL, template).** `server/_core/index.ts` boots an Express app, registers OAuth routes and a tRPC handler at `/api/trpc`. `server/routers.ts` currently exposes only `system.*` and `auth.{me,logout}`. Add product routes here when (and only when) a feature actually needs a backend — most of this app does not.

The client is wired to call the backend (see `lib/trpc.ts` + `lib/_core/api.ts`), so adding a tRPC procedure is a one-file change on each side once you also extend `drizzle/schema.ts`.

### URL/port mapping (web dev)

`constants/oauth.ts → getApiBaseUrl()` derives the backend origin on web by rewriting the `8081-…` hostname prefix to `3000-…`. So Metro and the API server are reachable on parallel subdomains in sandboxed environments; don't hardcode `localhost:3000`.

### `_core/` is off-limits

Anything under `server/_core/`, `lib/_core/`, or `shared/_core/` is framework/template plumbing. Treat as read-only unless you are intentionally extending infrastructure. Product code belongs in the files explicitly listed in `server/README.md` (`drizzle/schema.ts`, `server/db.ts`, `server/routers.ts`, `shared/types.ts`, `shared/const.ts`, plus `lib/`, `hooks/`, `components/`, `app/`, `tests/`).

### Provider tree (`app/_layout.tsx`)

```
ThemeProvider
  └─ SafeAreaProvider (web: also overrides SafeAreaInsetsContext + SafeAreaFrameContext)
       └─ GestureHandlerRootView
            └─ trpc.Provider (+ QueryClientProvider)
                 └─ PlanProvider
                      └─ Stack (expo-router, headerShown: false)
```

`PlanProvider` is the source of truth for all plan data. Every mutation goes through it — never call `savePlan`/`deletePlan` from `lib/storage.ts` directly inside a screen; use the context's `createPlan`/`updatePlan`/`addTask`/`toggleSubtask`/etc. so the in-memory reducer state stays consistent with AsyncStorage. The context's `addTask` family closes over `plans` and writes the entire plan back — be aware of this when adding new mutations.

### Routing

Expo Router with `experiments.typedRoutes: true`. The route map:
- `app/(tabs)/` — bottom tabs: `index` (home), `statistics`, `about`
- `app/plan-form.tsx`, `app/plan-detail/[id].tsx`
- `app/task-form/[planId].tsx`, `app/task-detail/[planId]/[taskId].tsx`
- `app/oauth/callback.tsx` (template auth deep link)
- `app/dev/theme-lab.tsx` (theme playground)

`Stack` defaults `headerShown: false` — set it per-screen via `Stack.Screen options` when you want a native header.

### Theming (NativeWind v4 + CSS variables)

`theme.config.js` defines `themeColors` with `light`/`dark` swatches. `tailwind.config.js` maps each color to a CSS variable (`var(--color-<name>)`) plus `light`/`dark` variants. `lib/theme-provider.tsx` writes those variables onto the root element and calls `nativewind.colorScheme.set(...)` whenever the scheme changes. To add a color: add it to `theme.config.js` *and* `constants/theme.ts` (`SchemeColors`) — both are referenced.

Tailwind class scan paths (in `tailwind.config.js`) are `app/`, `components/`, `lib/`, `hooks/`. New top-level directories with JSX need to be added there or their classes won't be picked up.

### Path aliases

- `@/*` → repo root (e.g. `@/lib/storage`, `@/components/screen-container`)
- `@shared/*` → `shared/*`

### Notifications

`lib/notifications.ts` uses `expo-notifications`. `Platform.OS === "web"` short-circuits to no-op everywhere — keep that pattern when adding notification logic. Reminders are keyed by `taskId` in `content.data`; `cancelTaskReminder` filters scheduled notifications by that field rather than tracking IDs separately.

### Backend specifics (only if you're touching `server/`)

- `server/db.ts` lazily creates the drizzle client. Every query helper must call `await getDb()` and return early (or throw) if it's `null` — local tooling runs without a DB.
- `server/_core/trpc.ts` exports `publicProcedure`, `protectedProcedure` (requires `ctx.user`), and `adminProcedure` (requires admin role).
- On the client, always handle `error.data?.code === 'UNAUTHORIZED'` from protected procedures by redirecting to login — see `server/README.md` for the template pattern.
- tRPC v11: `transformer: superjson` lives **inside** `httpBatchLink`, not at the root of `createClient`. Don't move it.
- After editing `drizzle/schema.ts`, run `pnpm db:push` (requires `DATABASE_URL`).
- All HTTP routes must be under `/api/...` so the gateway can route correctly (noted in `server/routers.ts`).

### App config / bundle ID

`app.config.ts` derives the iOS bundle ID, Android package, and deep-link scheme from a single hardcoded `rawBundleId`. `constants/oauth.ts` independently parses the **same** string to compute the deep-link scheme — if you change the bundle ID, change it in both places.

`newArchEnabled: true` and `experiments.reactCompiler: true` are on. Babel pipeline: `babel-preset-expo` with `jsxImportSource: "nativewind"` + `nativewind/babel` preset + `react-native-worklets/plugin`. Metro uses `withNativeWind(config, { input: "./global.css", forceWriteFileSystem: true })` — the `forceWriteFileSystem` flag is intentional (works around an iOS dev styling bug).

## Conventions

- TypeScript strict mode is on (`tsconfig.json`). Run `pnpm check` before assuming a change compiles.
- UI text is intentionally Chinese — match the surrounding strings rather than translating.
- Comments and JSDoc in `lib/storage.ts`, `lib/notifications.ts`, etc. are in Chinese; preserve that style when extending those modules.
- Use `ScreenContainer` (`components/screen-container.tsx`) as the root of every screen — it handles SafeArea + background color in one place. Default edges are `["top", "left", "right"]` so the tab bar can own the bottom inset.
- `cn(...)` from `lib/utils.ts` is the standard `clsx` + `tailwind-merge` helper for conditional Tailwind classes.

## Reference docs in the repo

- `README.md` — feature list, tech stack, data model overview (in Chinese)
- `design.md` — screen-by-screen spec and color palette
- `server/README.md` — extensive backend guide (auth, DB, tRPC, LLM, S3, image gen, voice transcription, env vars). Read only if the task actually needs the backend.
- `todo.md` — historical implementation checklist
