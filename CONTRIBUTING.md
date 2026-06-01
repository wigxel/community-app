# Contributing to Community App

Thank you for your interest in contributing! This guide walks you through everything you need to get the project running locally and submit a quality pull request.

---

## Table of Contents

- [Contributing to Community App](#contributing-to-community-app)
  - [Table of Contents](#table-of-contents)
  - [Prerequisites](#prerequisites)
  - [Forking and Cloning](#forking-and-cloning)
  - [Installing Dependencies](#installing-dependencies)
    - [Troubleshooting Dependency Conflicts](#troubleshooting-dependency-conflicts)
  - [Environment Setup](#environment-setup)
    - [Convex Setup](#convex-setup)
    - [Better Auth Setup](#better-auth-setup)
    - [Final `.env.local` Structure](#final-envlocal-structure)
  - [Running the App](#running-the-app)
  - [Branch Naming](#branch-naming)
  - [Commit Style](#commit-style)
    - [Making a Commit with Commitizen](#making-a-commit-with-commitizen)
    - [Commit Types](#commit-types)
  - [Before Submitting a PR](#before-submitting-a-pr)
  - [Pull Request Guidelines](#pull-request-guidelines)
  - [Reward](#reward)

---

## Prerequisites

Make sure you have the following installed before you begin:

- **Bun** v1.3.5 or higher — this project uses Bun as its primary package manager

  Install it from [https://bun.sh](https://bun.sh) or run:

  ```powershell
  npm install -g bun
  ```

  Verify the installation:

  ```bash
  bun --version
  ```

- **Node.js** v20 or higher
- **Git**

> **Why Bun?** The project declares `"packageManager": "bun@1.3.5"` in `package.json`. While `npm` can install dependencies, Bun is required for Husky's pre-push hook — pushing without it will fail with `bun: command not found`.

---

## Forking and Cloning

1. Click **Fork** on the top right of the repository page on GitHub.
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR_USERNAME/community-app.git
cd community-app
```

3. Add the upstream remote so you can pull future changes:

```bash
git remote add upstream https://github.com/wigxel/community-app.git
```

> **Note:** The active development branch is `staging`. Always create your branches from `staging` and target `staging` when opening PRs — not `master`.

---

## Installing Dependencies

Use Bun to install dependencies:

```bash
bun install
```

> Do **not** mix `npm install` and `bun install` in the same setup. If you accidentally ran `npm install` first, delete `node_modules` and `package-lock.json` before running `bun install`:
>
> ```powershell
> # Windows (PowerShell)
> Remove-Item -Recurse -Force node_modules
> Remove-Item package-lock.json
> bun install
> ```

> ```bash
> # macOS/Linux
> rm -rf node_modules package-lock.json
> bun install
> ```

### Troubleshooting Dependency Conflicts

This project uses cutting-edge package versions. If you encounter `ERESOLVE` peer dependency errors, resolve them in this order:

**React version mismatch:**

```bash
bun add react@~19.1.4 react-dom@~19.1.4
```

**Vitest version mismatch:**

```bash
bun add vitest@^4.0.16 @vitest/coverage-v8@^4.0.16
```

**`@types/node` version mismatch:**

```bash
bun add -d @types/node@^22.0.0
```

Or resolve all at once:

```bash
bun add react@~19.1.4 react-dom@~19.1.4 && bun add -d @types/node@^22.0.0 @vitest/coverage-v8@^4.0.16 vitest@^4.0.16
```

---

## Environment Setup

The app requires environment variables for two services: **Convex** (backend) and **better auth** (authentication). You will need accounts for both.

> ⚠️ **Important:** This project previously used Clerk for authentication. Clerk has been fully removed and replaced with Better Auth as of [PR #31](https://github.com/wigxel/community-app/pull/31). If you see any references to Clerk in older issues or discussions, ignore them — no Clerk account or API keys are needed.

Create a `.env.local` file in the project root — this file is gitignored and should never be committed. Use the included `.env.example` as your starting reference:

```bash
# macOS/Linux
cp .env.example .env.local

# Windows (PowerShell)
Copy-Item .env.example .env.local
```

### Convex Setup

Convex powers the backend, database, and real-time functions.

1. Run the Convex dev CLI — it will prompt you to log in and create a project:

```bash
npx convex dev
```

2. Log in with your GitHub account when prompted.
3. Accept the device name or enter a custom one.
4. Agree to the terms when asked.
5. Name your project (e.g. `community-app-dev`).

Convex will automatically write the following to your `.env.local`:

```env
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site
```

> Keep `bunx convex dev` running in a separate terminal while developing — it watches your `convex/` folder and syncs functions to the cloud in real time.

### Better Auth Setup

Better Auth handles authentication using `@convex-dev/better-auth` for Convex integration. Unlike the previous Clerk setup, it does not require a third-party account or external dashboard — authentication runs entirely through Convex.

Add the following to your `.env.local`:

```bash
SITE_URL=http://localhost:3000
```

> In production, `SITE_URL` should be set to your deployed app URL (e.g. `https://your-app.vercel.app`). Better Auth uses this to construct callback and redirect URLs correctly — an incorrect value here will cause authentication to silently fail.

### Final `.env.local` Structure

Your completed `.env.local` should look like this:

```env
# Convex (auto-generated by `bunx convex dev`)
CONVEX_DEPLOYMENT=your_deployment_name
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your-deployment.convex.site

# Better Auth
SITE_URL=http://localhost:3000
```

> Check the `.env.example` file at the root of the repo for the latest list of required variables — it is kept up to date with every auth or infrastructure change.

---

## Running the App

You need **two terminals** running simultaneously:

**Terminal 1 — Convex backend:**

```bash
bunx convex dev
```

**Terminal 2 — Next.js frontend:**

```bash
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Branch Naming

Create a new branch for every contribution. Use this naming convention:

| Prefix      | Use for                                    |
| ----------- | ------------------------------------------ |
| `feat/`     | New features                               |
| `fix/`      | Bug fixes                                  |
| `docs/`     | Documentation only                         |
| `refactor/` | Code restructuring without feature changes |
| `test/`     | Adding or updating tests                   |
| `chore/`    | Dependency updates, config changes         |

Always create your branch from `staging`:

```bash
git fetch upstream
git checkout -b feat/your-feature upstream/staging
```

Examples:

```bash
git checkout -b feat/user-profile-page upstream/staging
git checkout -b fix/better-auth-redirect upstream/staging
git checkout -b docs/update-env-setup upstream/staging
```

---

## Commit Style

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification and uses **Commitizen** to guide contributors through the correct commit format interactively.

### Making a Commit with Commitizen

Instead of running `git commit -m "..."` directly, use the Commitizen prompt:

```bash
bun run commit
```

This launches an interactive CLI that walks you through filling out your commit message step by step — no need to remember the format manually.

**Example session:**

```
? Select the type of change you're committing: (Use arrow keys)
❯ feat:     A new feature
  fix:      A bug fix
  docs:     Documentation only changes
  style:    Changes that do not affect the meaning of the code
  refactor: A code change that neither fixes a bug nor adds a feature
  test:     Adding missing tests or correcting existing tests
  chore:    Changes to the build process or auxiliary tools

? What is the scope of this change? (press enter to skip): profile

? Write a short, imperative description of the change:
  add avatar upload to user profile page

? Provide a longer description (press enter to skip):

? Are there any breaking changes? No

? Does this change affect any open issues? Yes → closes #42
```

Your final commit message will be generated as:

```
feat(profile): add avatar upload to user profile page

closes #42
```

### Commit Types

| Type       | When to use                                   |
| ---------- | --------------------------------------------- |
| `feat`     | A new feature                                 |
| `fix`      | A bug fix                                     |
| `docs`     | Documentation changes only                    |
| `style`    | Formatting, whitespace — no logic changes     |
| `refactor` | Code restructuring without behaviour change   |
| `test`     | Adding or updating tests                      |
| `chore`    | Dependency updates, config or tooling changes |

> **Why Commitizen?** Consistent commit messages make the project history easier to read, help automate changelogs, and make it clear at a glance what every change does. `bun run commit` ensures every contributor follows the same format without having to memorise it.

Husky is configured to run lint-staged checks on every commit. Your staged files will be automatically linted and formatted before the commit goes through.

---

## Before Submitting a PR

Run the full check to ensure everything passes:

```bash
bun run round-check
```

This runs lint, format, tests, and a production build in sequence. Fix any failures before opening your PR.

Also make sure:

- [ ] `.env.local` is **not** included in your commit
- [ ] `bun.lock` is excluded unless your PR intentionally updates dependencies
- [ ] `convex/` folder changes are discarded — run `git restore convex/` before staging
- [ ] Your branch is up to date with the upstream `main` branch:

```bash
git fetch upstream
git rebase upstream/staging
```

> The pre-push hook runs `next build` which fails with a Clerk `Missing publishableKey` error if Clerk environment variables are not fully configured. Use `git push --no-verify` only for documentation-only changes where the build failure is unrelated to your contribution.

---

## Pull Request Guidelines

- **One concern per PR** — keep PRs focused and small where possible
- **Fill out the PR description** — explain what you changed and why
- **Reference related issues** — use `Closes #123` or `Relates to #123` in the description
- **Dependency changes** — if you updated packages, explain the reason in the PR description
- **Screenshots** — include before/after screenshots for any UI changes
- If you were unable to test locally due to missing credentials, note this clearly in the PR and ask the maintainer to verify

---

## Reward

Every completed task comes with a base reward. Finishing within a set time window before the deadline earns you an additional bonus on top of that reward. 🎉

---

If you run into any issues not covered here, please open a GitHub issue so we can improve this guide.
