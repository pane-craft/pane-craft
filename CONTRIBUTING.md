# Contributing to @pane-craft/react

Thanks for your interest! Here's how to get started contributing.

## Local setup

```bash
git clone https://github.com/pane-craft/pane-craft.git
cd pane-craft
pnpm install
pnpm storybook
```

This project uses [pnpm](https://pnpm.io). The version is pinned via the
`packageManager` field in `package.json`.

## Making a change

1. Fork the repo and create a branch from `main`.
2. Make your change. Add or update unit tests and Storybook stories.
3. Run the local checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   ```
4. Add a changeset if your PR makes a user-facing change:
   ```bash
   pnpm changeset
   ```
   Pick the appropriate semver bump (patch / minor / major) and write a short description for the changelog. If your change is internal-only (docs, CI, refactor), no changeset is needed — the [changeset-bot](https://github.com/apps/changeset-bot) will let you mark it as such on the PR.
5. Open a PR against `main`. CI will run lint, typecheck, tests, build, and the Storybook build. All must pass before a maintainer reviews.

## Code style

- Use TypeScript with TSDoc comments to expose documentation to consumers.
- ESLint and Prettier are enforced in CI (`pnpm lint`, `pnpm format:check`).
- Run `pnpm format` and `pnpm lint:fix` before pushing.

## Security issues

Please don't file security issues publicly. See [SECURITY.md](./SECURITY.md) for how to report them privately.
