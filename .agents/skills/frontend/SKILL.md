---
name: frontend
description: Frontend development rules and patterns for Next.js/React projects
---

# Frontend Skill

## Tech Stack

- Next.js 15 (App Router)
- React 19
- Shadcn UI components
- TanStack Query
- Effect-ts
- React Hook Form + Zod
- Lucide React icons
- Motion (for animations)

## Conventions

### Component Structure

- Path: `components/`
- UI components: `components/ui/`
- Feature components: `components/[feature]/`

### Form Pattern (from form.dialog.mdc)

Dialog → Integrated → Form:

- `FooDialog.tsx` - Dialog wrapper with trigger button
- `FooIntegrated.tsx` - Form logic + submission handling
- `FooForm.tsx` - Pure form with react-hook-form + zod validation

### Hooks

- Path: `hooks/`
- Use for reusable state/logic

### State Management

- **TanStack Query**: server state, API calls
- **React useState**: local component state
- **Zustand**: global client state

### UI Guidelines (from ui.mdc)

- Prefer shadcn components over custom ones
- Use Lucide React icons exclusively
- Use appropriate color variables from theme
- Small, composable components over large monolithic ones
- Use `cn` helper for conditional and dynamic classname concatenation

### Currency Formatting (Naira)

```typescript
const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
```

Returns: "₦1,500"

### TanStack Query Usage

```typescript
// Query
const data = useQuery(api.myFunction, { arg });

// Mutation
const mutate = useMutation(api.myMutation);
mutate({ arg });
```

### React Hook Form + Zod

```typescript
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "Required"),
});

const { register, handleSubmit } = useForm({
  resolver: zodResolver(schema),
});
```

### Alerts and Dialogs

- Use shadcn `AlertDialog` for destructive actions
- Use shadcn `Dialog` for forms

### Tabs

- Use shadcn `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`

## Code Optimization

### Extract Repeated Lookups

Instead of repeated `find()` calls in JSX:

```typescript
// Bad - repeated find in JSX
<Form initialData={currentPlanId ? plans.find(p => p.id === currentPlanId) : undefined} />

// Good - extract to variable
const currentPlan = plans.find(p => p.id === currentPlanId);
<Form initialData={currentPlan} />
```

### Memoize Expensive Computations

```typescript
const computed = React.useMemo(() => expensiveOperation(data), [data]);
```

### Early Return Pattern

Return early to reduce nesting:

```typescript
if (!data) return <Skeleton />;

return ( /* main content */ );
```

### Derived State in JSX

Avoid creating separate state for derived values:

```typescript
// Bad - duplicate state
const [filtered, setFiltered] = useState(data);
useEffect(() => setFiltered(data.filter(...)), [data]);

// Good - derive in render
const filtered = data.filter(...);
```

### Object Extraction for Repeated Props

```typescript
// Bad
<Component a={obj.a} b={obj.b} c={obj.c} d={obj.d} />

// Good
const { a, b, c, d } = obj;
<Component a={a} b={b} c={c} d={d} />

// Or as spread
<Component {...pick(obj, 'a', 'b', 'c', 'd')} />
```

### Form Component Props Pattern

Forms should use local `isSubmitting` state passed to `isLoading` prop:

```typescript
const [isSubmitting, setIsSubmitting] = useState(false);

<Form
  isLoading={isSubmitting}
  onSubmit={async (values) => {
    setIsSubmitting(true);
    try {
      await mutation(values);
    } finally {
      setIsSubmitting(false);
    }
  }}
/>

// Form button shows "Saving..." when isLoading=true
```

### Avoid Inline Arrow Functions in JSX

Inline functions cause child components to rerender on every parent render:

```typescript
// Bad - creates new function each render
<Button onClick={() => handleClick(id)} />

// Good - use stable handler, pass id as argument
<Button onClick={handleClick} payload={id} />
```

### Conditional Rendering with Maps

Prefer map with direct access over multiple/nested ternary operations for JavaScript conditionals.

```typescript
// Bad - nested ternaries
const value = var === "a" ? 1 : var === "b" ? 2 : var === "c" ? 3 : "default";

// Good - map lookup
const valueMap = {
  "a": 1,
  "b": 2,
  "c": 3
};
const value = valueMap[var] || "default";
```

### Conditional Rendering

```typescript
// Show/Hide with && (for no else case)
{isOpen && <Content />}

// Ternary for else case
{isOpen ? <OpenState /> : <ClosedState />}
```

### Compound Component Pattern

Group related components for cleaner exports:

```typescript
// Instead of
export { Button } from "./button";
export { ButtonGroup } from "./button-group";

// Use compound component
export const Button = Object.assign(ButtonRoot, { Group: ButtonGroup });
// Usage: <Button.Group>
```
