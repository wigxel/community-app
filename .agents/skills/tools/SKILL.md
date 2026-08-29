---
name: tools
description: Development tooling best practices for Convex, Effect-TS, and TypeScript
---

# Tools Skill

## Convex
> See [convex.mdc](./convex.mdc) for full details.

- Group related mutations/queries in the same file
- Use `ConvexError` instead of generic JS `Error`
- Validate all inputs with proper validators (`convex/values`)
- Use `v.array(v.id("..."))` instead of `v.optional(v.array(v.id("...")))` — pass empty `[]` instead of `undefined`
- Full-text search is not supported in Convex query filters; use simple equality instead
- `useQuery` returns data directly (or `undefined` while loading), **not** an object with `isLoading`
- Call mutations from actions via `ctx.runMutation(internal.xxx, args)`
- **Dependency Rule**:
  - `query()`: `ctx.auth`, `ctx.db`, `ctx.runQuery`
  - `mutation()`: `ctx.runQuery`, `ctx.runMutation`, `ctx.storage`, `ctx.runAction`, `ctx.auth`, `ctx.scheduler` — **no** `ctx.db`
  - `action()`: same as mutation — **no** `ctx.db`

## Effect-TS
> See [effect.mdc](./effect.mdc) for full details.

- **Never return `null`**. Use Effect types to represent absence or errors.
- **2 return statements** → `Effect.Option<T>` (`Option.some` / `Option.none`)
- **3+ return statements** → `Effect.Either<Error, T>` (`Either.right` / `Either.left`)
- Use `pipe(...)` (standalone, not method-style) for simple chains
- Use `Effect.gen` / `yield*` for complex business logic (deep nesting)
- Place `runPromise` as the last argument in pipe chains
- For multi-line `Effect.gen` blocks, assign to a variable first, then pass directly to `runPromise` (skip `pipe`)
- With exactly 2 args (effect + `runPromise`), call `runPromise(effect)` directly
- Does **not** apply to Convex Queries

## TypeScript
> See [typescript.mdc](./typescript.mdc) for full details.

- Always type React components with explicit interfaces
- Never use `any` unless absolutely necessary
- Never use non-null assertion (`!`)
- Prefer `type` over `interface` for simple type definitions
- Prefer `type import` for interfaces exported from modules
- Use path aliases for shorter imports
- Default exports should be the last statement in every module
- Shared interfaces: `src/types` folder organized by domain
- Use intersection types, generic types, and utility types (`Pick`, `Omit`, `Partial`) for reusable patterns
- Use discriminated unions for type safety and clarity
