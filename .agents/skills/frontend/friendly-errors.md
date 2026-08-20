---
name: user-friendly-errors
description: Design and implement user-friendly error objects/responses for backend APIs (Node/Express, Next.js API routes, etc.) that cleanly separate what happened, why it happened, reassurance, recovery action, and retryability, so the frontend can render helpful error UI (modals, toasts, banners) without hardcoding strings. Use this skill whenever the user asks to design an error object/class, error response shape, error handling middleware, or how to "relay error info to the frontend" — even if they don't use the words "user-friendly" or mention UI copy explicitly. Also use when reviewing or refactoring existing error handling that returns raw stack traces, generic "Something went wrong" messages, or inconsistent error shapes across endpoints.
---

# User-Friendly Errors

A pattern for structuring backend error objects so the frontend has everything
it needs to render clear, humane error UI — instead of a generic message or
a raw stack trace.

## Core idea

Good user-facing error UI usually does five things (see any well-designed
error modal/toast):

1. **Say what happened** — a short, specific title
2. **Provide reassurance** — confirm nothing was lost (if true)
3. **Say why it happened** — a plain-language reason, no jargon/codes
4. **Give them a way out** — a dismiss/cancel path, not a dead end
5. **Help them fix it** — a concrete next action (retry, contact support, etc.)

The backend error object should carry each of these as a **separate field**,
not one baked-in sentence. That lets the frontend:
- render pieces independently (icon + title, then reason as subtext, etc.)
- swap in i18n translations per field
- decide button behavior generically instead of parsing strings
- log/alert on `code` while showing something kind to the user

Never conflate the human-readable message with the machine-readable code.
Never send stack traces, internal error messages, or DB details to the client.

## The shape

```javascript
class VividError extends Error {
  constructor({
    code,             // machine-readable: "ACCOUNT_CONNECT_FAILED"
    title,            // "Unable to connect your account"
    reassurance = null, // "Your changes were saved" (omit if nothing to reassure about)
    reason,           // "we could not connect your account due to a technical issue on our end"
    action = null,    // { label: "Try Again", type: "retry" }
    retryable = true, // drives whether a Cancel/dismiss path is offered
    supportUrl = null,
    statusCode = 500,
    meta = {}         // server-side only debug info, never serialized to client
  }) {
    super(title);
    this.name = 'VividError';
    Object.assign(this, {
      code, title, reassurance, reason, action, retryable, supportUrl, statusCode, meta
    });
  }

  toJSON() {
    const { code, title, reassurance, reason, action, retryable, supportUrl } = this;
    return { error: { code, title, reassurance, reason, action, retryable, supportUrl } };
  }
}
```

**Field-to-purpose map:**

| Field | Purpose |
|---|---|
| `title` | Say what happened |
| `reassurance` | Provide reassurance (omit the field entirely if nothing was preserved) |
| `reason` | Say why it happened |
| `retryable` | Whether the frontend offers a way out (Cancel/dismiss) vs. a dead-end/blocking state |
| `action` | Help them fix it (`{ label, type }` — frontend maps `type` to behavior) |
| `code` | Internal routing/logging, drives icon/analytics, never shown raw to user |
| `meta` | Stack traces, provider names, internal IDs — stripped before response, kept in logs |

## Central error-handling middleware (Express example)

Route errors through one place so every endpoint returns the same shape,
and so `meta`/stack traces never leak by accident.

```javascript
app.use((err, req, res, next) => {
  if (err instanceof VividError) {
    console.error(`[${err.code}]`, err.meta); // full detail server-side only
    return res.status(err.statusCode).json(err.toJSON());
  }
  // Unknown/unexpected errors: never leak internals, always give the user an out
  console.error('Unhandled error:', err);
  return res.status(500).json({
    error: {
      code: 'UNKNOWN_ERROR',
      title: 'Something went wrong',
      reassurance: null,
      reason: 'An unexpected error occurred on our end.',
      action: { label: 'Try Again', type: 'retry' },
      retryable: true,
      supportUrl: '/support/contact'
    }
  });
});
```

## Examples

### Example 1: Third-party connection failure (the reference case)

```javascript
throw new VividError({
  code: 'ACCOUNT_CONNECT_FAILED',
  title: 'Unable to connect your account',
  reassurance: 'Your changes were saved',
  reason: 'we could not connect your account due to a technical issue on our end',
  action: { label: 'Try Again', type: 'retry' },
  retryable: true,
  supportUrl: '/support/contact',
  statusCode: 502,
  meta: { provider: 'stripe', internalErrorId: 'e_8f3a1c' }
});
```

### Example 2: Validation error (no reassurance needed, no retry action — user must fix input)

```javascript
throw new VividError({
  code: 'INVALID_EMAIL',
  title: "That email doesn't look right",
  reassurance: null, // nothing was saved yet, no need to reassure
  reason: 'Please double check the email address and try again.',
  action: null, // no automatic action — user edits the field themselves
  retryable: true,
  statusCode: 422
});
```

### Example 3: Payment failure (destructive-feeling, needs strong reassurance + clear next step)

```javascript
throw new VividError({
  code: 'PAYMENT_DECLINED',
  title: 'Your payment could not be processed',
  reassurance: "You haven't been charged",
  reason: 'Your card issuer declined the transaction.',
  action: { label: 'Use a different card', type: 'navigate', target: '/billing/payment-methods' },
  retryable: true,
  supportUrl: '/support/billing',
  statusCode: 402,
  meta: { provider: 'stripe', declineCode: 'insufficient_funds' }
});
```

### Example 4: Rate limit (no user-fixable action — just wait, so no retry button)

```javascript
throw new VividError({
  code: 'RATE_LIMITED',
  title: "You're doing that too fast",
  reassurance: null,
  reason: 'Please wait a minute before trying again.',
  action: null,
  retryable: false, // don't show Try Again — retrying immediately won't help
  statusCode: 429
});
```

### Example 5: Fatal/unrecoverable error (no way out except leaving — rare, use sparingly)

```javascript
throw new VividError({
  code: 'SESSION_EXPIRED',
  title: 'Your session has expired',
  reassurance: 'Any saved work is still there',
  reason: 'For your security, you were signed out after a period of inactivity.',
  action: { label: 'Log in again', type: 'navigate', target: '/login' },
  retryable: false,
  statusCode: 401
});
```

### Example 6: Effect-TS (tagged errors + schema-validated payload)

If the backend uses [Effect](https://effect.website) instead of plain
`throw`/try-catch, model each error as a `Data.TaggedError` (or a
`Schema.TaggedError` if you want runtime validation/serialization for free).
Keep the same five fields — Effect's tagging just replaces `code`/`instanceof`
checks with exhaustive, type-safe matching.

```typescript
import { Data, Effect, Schema } from "effect"

// Schema.TaggedError gives you runtime validation, a matching Schema for
// encoding the HTTP response, and a stable `_tag` for exhaustive matching —
// all in one declaration.
class AccountConnectFailed extends Schema.TaggedError<AccountConnectFailed>()(
  "AccountConnectFailed",
  {
    title: Schema.String,
    reassurance: Schema.NullOr(Schema.String),
    reason: Schema.String,
    action: Schema.NullOr(
      Schema.Struct({ label: Schema.String, type: Schema.Literal("retry", "navigate", "contact_support") })
    ),
    retryable: Schema.Boolean,
    supportUrl: Schema.NullOr(Schema.String),
    statusCode: Schema.Number,
  }
) {}

class PaymentDeclined extends Schema.TaggedError<PaymentDeclined>()("PaymentDeclined", {
  title: Schema.String,
  reassurance: Schema.NullOr(Schema.String),
  reason: Schema.String,
  action: Schema.NullOr(Schema.Struct({ label: Schema.String, type: Schema.Literal("retry", "navigate") })),
  retryable: Schema.Boolean,
  supportUrl: Schema.NullOr(Schema.String),
  statusCode: Schema.Number,
}) {}

// Usage inside an Effect pipeline — fail with the tagged error, don't throw
const connectAccount = (userId: string) =>
  Effect.tryPromise({
    try: () => stripe.accounts.connect(userId),
    catch: (cause) =>
      new AccountConnectFailed({
        title: "Unable to connect your account",
        reassurance: "Your changes were saved",
        reason: "we could not connect your account due to a technical issue on our end",
        action: { label: "Try Again", type: "retry" },
        retryable: true,
        supportUrl: "/support/contact",
        statusCode: 502,
        // `cause` (the raw provider error) stays inside the Effect's error
        // channel for logging via Effect.tapErrorCause — it's never spread
        // into the tagged error's own fields, so it can't leak to the client.
      }),
  })

// Central handler: exhaustively match every tagged error to an HTTP response.
// Effect.catchTags forces you to handle each _tag (or fall through to a
// generic 500), so it's impossible to forget a case as new error types are added.
const toHttpResponse = <E extends { title: string; reassurance: string | null; reason: string;
  action: unknown; retryable: boolean; supportUrl: string | null; statusCode: number }>(error: E) =>
  Effect.succeed({
    status: error.statusCode,
    body: {
      error: {
        title: error.title,
        reassurance: error.reassurance,
        reason: error.reason,
        action: error.action,
        retryable: error.retryable,
        supportUrl: error.supportUrl,
      },
    },
  })

const program = connectAccount(userId).pipe(
  Effect.catchTags({
    AccountConnectFailed: toHttpResponse,
    PaymentDeclined: toHttpResponse,
  }),
  // Anything un-tagged (defects) still gets a safe, generic response —
  // mirrors the Express middleware's "Unknown/unexpected errors" branch
  Effect.catchAllDefect(() =>
    toHttpResponse({
      title: "Something went wrong",
      reassurance: null,
      reason: "An unexpected error occurred on our end.",
      action: { label: "Try Again", type: "retry" },
      retryable: true,
      supportUrl: "/support/contact",
      statusCode: 500,
    })
  ),
  Effect.tapErrorCause(Effect.logError) // full detail (incl. raw `cause`) to logs only
)
```

**Why this fits the pattern well:** Effect's `_tag` is a stronger version of
the plain `code` field — you get compiler-enforced exhaustiveness (`catchTags`
won't compile if you add a new tagged error and forget to handle it), and
`Schema.TaggedError` doubles as the validation/encoding logic for the JSON
response, so the "never leak `meta`/internal fields" rule from the checklist
is enforced by the type system instead of by discipline alone.

## Frontend consumption pattern

The frontend should branch on `code`/`action.type`, never parse `title`/`reason` strings:

```javascript
function handleActionClick(error) {
  switch (error.action?.type) {
    case 'retry': return retryLastRequest();
    case 'navigate': return router.push(error.action.target);
    case 'contact_support': return window.open(error.supportUrl, '_blank');
    default: return; // no action, dismiss-only
  }
}
```

Render `title` as the heading, `reassurance` (if present) as the first line
of body text, `reason` as the following sentence, and use `retryable` to
decide whether a Cancel/dismiss control is shown alongside the primary
`action` button.

## Checklist when writing a new error

- [ ] `title` is specific, not generic ("Unable to connect your account", not "Error")
- [ ] `reassurance` is included whenever something was actually preserved — and is only ever true statements (don't reassure "your changes were saved" if they weren't)
- [ ] `reason` is plain language, no error codes/jargon/stack traces
- [ ] `action` is either a real, useful next step or `null` — don't add a fake "Try Again" if retrying can't possibly help (e.g. validation errors, rate limits)
- [ ] `retryable` correctly drives whether the user has a way out
- [ ] `meta` never ends up in `toJSON()`/the client response
- [ ] `code` is stable and used for logging/analytics, not shown raw to the user
