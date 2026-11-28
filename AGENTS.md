<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read `convex/_generated/ai/guidelines.md` first** for important guidelines on how to correctly use Convex APIs and patterns. The file contains rules that override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running `npx convex ai-files install`.

<!-- convex-ai-end -->

## GitHub issues

When creating GitHub issues (feature requests especially), follow the template
at `.github/ISSUE_TEMPLATE/feature_request.md`:

- Title: `[FEATURE] <one line>`, labeled `enhancement`
  (`gh issue create --label enhancement`).
- Keep the template's section order: Summary, Problem Statement, Proposed
  Solution, Affected Area, User Story, Alternatives Considered, Mockup /
  Reference, Additional Context, and the closing willingness checkboxes.
- Fill every section; drop one only when it genuinely does not apply. The
  Affected Area and willingness checkboxes stay in the body, ticked or not.
- When the issue mirrors a bead, end the body with `Bead: <id>` and comment
  the issue URL back onto the bead (`bd comment <id> "GitHub issue: <url>"`).

## Pull requests

Never push to `main`. Every change lands through a PR against `main`.

### Branch

Branch from a fresh `origin/main`, one concern per branch, named
`<type>/<bead-id>-<slug>`:

    fix/community-app-92o-zeptomail
    feat/community-app-t4r-todoist-mirror

`type` is one of `fix`, `feat`, `chore`, `refactor`, `perf`, `test`, `docs`.
Use the full bead id (`community-app-<hash>`), never the bare `bd-<hash>`
short form — `bd show bd-92o` fails, so a branch carrying it cannot be traced
back to its bead. PR-feedback branches use `pr-comment/<pr-number>` instead.

### Gates before you open

- `bunx vitest run <changed test files>`
- `bun run lint` — Biome and tsc.

The husky pre-push hook runs lint and build, so a clean push means the gates
passed. Never skip the gates themselves.

### Title

Conventional Commits, 72 characters at most, scope optional:

    fix(display-qr): handle failed QR refresh instead of leaving a dead code

### Body

Keep these sections, in this order. `## In plain words` is required on every
PR; delete the others when they do not apply:

1. `## In plain words` — the problem and the fix in language a smart
   nine-year-old could follow.
2. `## Issue` — bead id or GitHub issue number, error text, page, occurrences.
3. `## Evidence` — the code path and why it fails; quote the lines that matter.
4. `## What changed` — one bullet per file, naming the behaviour change.
5. `## Tests` — the exact commands and their results, so a reviewer knows
   what you did and did not run.
6. `## Notes` or `## Not changed here` — migrations, follow-ups, related issues
   you ruled out and why.

#### `## In plain words`

Two short paragraphs, 120 words at most:

- What was broken, as the person using the product felt it. Name the screen and
  the symptom: "the customers page stopped at 50 people, so Next went grey and
  everyone past #50 was invisible."
- What now happens instead, in the same terms.

Rules:

- No file paths, function names, error codes, or jargon (index, cursor,
  aggregate, race, idempotent, payload). If a nine-year-old would not know the
  word, define it in passing or drop it.
- Say what the user sees, not how the code works. "The list keeps loading" —
  not "the cursor is threaded through paginationOpts".
- An analogy is fine when it makes the mechanism obvious, one sentence, and it
  must not soften the consequence.
- Never claim more than `## Evidence` supports. If the fix is partial, say
  which part is still wrong.
- No filler: "the system now works correctly" says nothing and is rejected.

Example:

    ## In plain words

    The customers page only ever showed the first 50 people. If you kept
    clicking Next it turned grey while hundreds more customers were still
    waiting behind it, so anyone past #50 could not be found, edited or
    checked.

    The page now fetches the next batch each time you reach the end of what
    it has, so Next keeps working until the last customer.

Open with:

    gh pr create --repo wigxel/community-app --base main \
      --title "fix(scope): …" --body-file -

Pipe the body in on stdin; never leave a placeholder section.

### Draft or ready

Open ready only when the gates above ran and the diff is complete. Use `--draft`
when a gate could not run or the work is a first pass. Do not flip a draft to
ready without running the gates.

### Link the work

- Put `Bead: <id>` in the body, and mention the issue's assignee as the
  reviewer when the bead came from a GitHub issue.
- Never write "Fixes #<n>" or any other closing keyword: the merge reconciler
  closes the issue itself after posting a thank-you comment.
- Comment the PR URL back on the bead: `bd comment <id> "PR: <url>"`.
- Leave the bead open until the PR merges.

### Review comments

Address feedback in a new commit on the same branch — never force-push a branch
someone has reviewed. Reply on the PR with what changed and the commit sha.

### Never

merge, deploy, push to `main`, close someone else's PR, or rewrite a shared
branch's history.

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:970c3bf2 -->

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:

   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   bd dolt push
   git push
   git status
   ```

5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**

- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->

<!-- BEGIN BEADS CODEX SETUP: generated by bd setup codex -->

## Beads Issue Tracker

Use Beads (`bd`) for durable task tracking in repositories that include it. Use the `beads` skill at `.agents/skills/beads/SKILL.md` (project install) or `~/.agents/skills/beads/SKILL.md` (global install) for Beads workflow guidance, then use the `bd` CLI for issue operations.

### Quick Reference

```bash
bd ready                # Find available work
bd show <id>            # View issue details
bd update <id> --claim  # Claim work
bd close <id>           # Complete work
bd prime                # Refresh Beads context
```

### Rules

- Use `bd` for all task tracking; do not create markdown TODO lists.
- Run `bd prime` when Beads context is missing or stale. Codex 0.129.0+ can load Beads context automatically through native hooks; use `/hooks` to inspect or toggle them.
- Keep persistent project memory in Beads via `bd remember`; do not create ad hoc memory files.

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

<!-- END BEADS CODEX SETUP -->

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
