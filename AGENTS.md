<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Relative — instructions for coding agents

Read [docs/PROJECT.md](docs/PROJECT.md) first. It is the project passport: what Relative is, who it is for, the screens, the data, the design system, and the rules. Do not re-explain the product from scratch, and do not contradict the passport.

## Rules

- The license is MIT (`LICENSE`). Keep it.
- Never name the real company this concept was inspired by. Not in code, docs, commits, or pull request text. The product is Relative. The figures and the manufacturers in the seed are fictional.
- One change per pull request.
- The owner merges. Open the pull request and stop.

## Checks

Node 22 (`.nvmrc`). Package manager is pnpm.

```bash
pnpm install
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run test:e2e
```

`pnpm run typecheck` is `next typegen && tsc --noEmit`. `pnpm test` is Vitest (`lib/**/*.test.ts`, `data/**/*.test.ts`). `pnpm run test:e2e` is Playwright. Locally it builds and starts the production server; in CI it expects `pnpm start` after the workflow's build. The gate is `.github/workflows/ci.yml`: frozen install, typecheck, lint, unit tests, production build, Playwright Chromium.

Before writing app code, read the Next.js guides in `node_modules/next/dist/docs/`. Leave the Next.js block at the top of this file in place.

## When behaviour changes

Every pull request that changes product behaviour updates **Status** and **Known gaps / next ideas** in `docs/PROJECT.md` in the same change, so the passport stays true.
