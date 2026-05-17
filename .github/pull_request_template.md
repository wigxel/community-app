# Summary

<!-- Briefly describe what this PR does and why. One paragraph is enough. -->

## Related Issue

<!-- Link the issue this PR resolves. Use the format below so GitHub auto-closes it on merge. -->

Closes #

<!-- If this PR relates to an issue without closing it, use: Relates to # -->

## Type of Change

<!-- Check the one that applies -->

- [ ] Bug fix (fixes an issue without breaking existing functionality)
- [ ] New feature (adds functionality without breaking existing behaviour)
- [ ] Breaking change (existing functionality changes or is removed)
- [ ] Documentation update (README, CONTRIBUTING, templates, etc.)
- [ ] Refactor (code restructuring, no behaviour changes)
- [ ] Test (adding or updating tests only)
- [ ] Chore (dependency update, config change, tooling)

## What Changed

<!-- List the key changes made in this PR. Be specific enough that a reviewer
     knows where to look without reading every line. -->

-
-
-

## Screenshots / Screen Recording _(UI changes only)_

<!-- If your PR touches any UI — layout, styling, components, profile pages — include
     before and after screenshots or a short screen recording. PRs with UI changes
     submitted without visuals may be delayed in review. -->

| Before | After |
| ------ | ----- |
|        |       |

## Testing Done

<!-- Describe how you tested your changes locally. -->

- [ ] Ran `bun run round-check` and all checks passed (lint, format, tests, build)
- [ ] Tested authentication flow (sign in / sign up / session handling)
- [ ] Tested the specific feature or fix in the browser at `http://localhost:3000`
- [ ] Verified Convex functions sync correctly (`bunx convex dev` running in parallel)
- [ ] Added or updated tests where applicable

## Pre-submission Checklist

<!-- Go through this before opening the PR. Unchecked items may block the review. -->

- [ ] My branch is up to date with `upstream/main` (`git fetch upstream && git rebase upstream/main`)
- [ ] `.env.local` is **not** included in this commit
- [ ] `bun.lock` is excluded unless this PR intentionally updates dependencies
- [ ] `convex/` folder changes are discarded unless this PR intentionally modifies backend functions (`git restore convex/`)
- [ ] My commit messages follow the conventional commit format (`feat:`, `fix:`, `docs:`, etc.)
- [ ] I have not introduced any new lint or TypeScript errors

## Additional Notes for Reviewers

<!-- Anything the reviewer should know — tricky logic, known limitations,
     follow-up tasks, or areas you'd like specific feedback on. -->
