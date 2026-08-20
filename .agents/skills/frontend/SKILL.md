---
name: frontend
description: Frontend development rules and patterns for Next.js/React projects
---

# Frontend Skill

## Tech Stack
- Next.js 15 (App Router)
- React 19
- Shadcn UI components
- TanStack Table + TanStack Query + TanStack Router
- Effect-ts
- React Hook Form + Zod
- Lucide React icons
- Convex (backend)
- date-fns
- sonner (toasts)
- Motion (for animations)

## Conventions

### TypeScript
- Always type React components with explicit interfaces
- Never use `any` unless absolutely necessary
- Use `type` instead of `interface` for simple type definitions
- Ensure convex functions have proper type definitions
- Prefer `type import` for interfaces exported from modules
- Use path aliases for shorter imports
- Default exports should be last statement in every module
- Place shared interfaces in `src/types` folder, organized by domain
- Use intersection types, generic types, and utility types (`Pick`, `Omit`, `Partial`) for reusable patterns
- Use discriminated unions for type safety and clarity

### Naming Convention
- Use kebab-case for file names (e.g., `DocumentGetting.tsx` → `document-getting.tsx`, `useDocument` → `use-document.ts`)

### Code Style
> See [code-style.mdc](./code-style.mdc) for full details.

#### Import Order
1. React and Next.js imports
2. External libraries and dependencies
3. Convex-specific imports
4. Internal components and utilities
5. Type imports
6. CSS/style imports

### Component Structure
- Components: `components/`
- ShadcnUI derived components: `components/ui/`
- Feature components: `components/[feature]/`

### Component Patterns
> See [react.mdc](./react.mdc) for full details.

### UI Guidelines
- Always use `rem` units for spacing, sizing, and typography — never `px`
> See [ui.mdc](./ui.mdc) for full details.

### Layout
> See [layout.mdc](./layout.mdc) for full details (form placement, data-fetching states, grid rules).

#### Data Fetching: Three States
Every data-fetching component must handle:

1. **Loading** — Show skeleton placeholder matching the content layout:
   ```typescript
   if (!data) return <Skeleton />;
   ```

2. **Empty** — Show empty state message:
   ```tsx
   <EmptyState isEmpty={data.length === 0}>
     <EmptyStateContent>
       <EmptyStateTitle>title</EmptyStateTitle>
       <EmptyStateDescription>description</EmptyStateDescription>
     </EmptyStateContent>
     <EmptyStateConceal>
       <Content data={data} />
     </EmptyStateConceal>
   </EmptyState>
   ```

3. **Success** — Render the data inside `<EmptyStateConceal>`

Prefer shadcn `Skeleton` component for loading.

#### Grids for Catalogs
- 5 columns for xl screens
- 4 columns for lg
- 3 columns for tablet
- 1 column for mobile

### Form Pattern
> See [form.mdc](./form.mdc) and [form.dialog.mdc](./form.dialog.mdc) for full form and dialog patterns.

#### Form Generation Rules
- Use Shadcn Form components
- Use react-hook-form for form state management
- Use Zod for validation
- Each form must be in its own file
- Forms must be pure components
- Props: `initialFormData` (optional), `isLoading` (optional), `onSubmit` (required), explicit `defaultState`, `ref` for form.reset()
- Validation logic and schema must be in the same module
- Form default state must be provided outside the component scope

#### Submit Button
- Must be disabled + reflect pending state text (e.g., "Creating..." instead of "Create Form") when `form.formState.isSubmitting` is true

#### After Submission
- Add a toast for success and failure cases using `sonner`:
  ```typescript
  toast.success("Record created successfully");
  toast.error("Error creating a record", { description: 'Error Message' });
  ```

#### Form Dialog Components

1. **`[FormName]Dialog`** (e.g., `CaseFormDialog.tsx` in `components/[feature]/`)
   - Dialog wrapper that manages its own `open`/`onOpenChange` state
   - Props: `children: React.ReactNode` (trigger button element)
   - Renders `[FormName]Integrated` inside `DialogContent`

2. **`[FormName]Integrated`** (e.g., `CaseFormIntegrated.tsx` in `components/[feature]/`)
   - Encapsulates form logic, submission handling, and data interaction
   - Props: `onClose: () => void`
   - Renders `[FormName]Form` with submission handler

3. **`[FormName]Form`** (e.g., `CaseForm.tsx` in `components/forms/`)
   - Pure form component — rendering, input management, validation only
   - Props: `initialFormData?`, `submitHandler`, `ref?`

### Tables
> See [table.mdc](./table.mdc) for full TanStack Table rules via AppDataTable.

### Routing
> See [tanstack-router.mdc](./tanstack-router.mdc) for routing conventions.

### Next.js
> See [next-js.mdc](./next-js.mdc) for Next.js-specific rules.

### Hooks
- Path: `hooks/`
- Use for reusable state/logic

### Error Handling
> See [friendly-errors.md](./friendly-errors.md) for user-friendly error patterns.

### State Management
- **TanStack Query**: server state, API calls
- **React useState**: local component state
- **Zustand**: global client state

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
> See [form.mdc](./form.mdc) for full form generation rules.

### Alerts and Dialogs
> See [form.dialog.mdc](./form.dialog.mdc) for the full form-in-dialog pattern.

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

### cleanup
- run format script after make changes. `bun format`, `pnpm format`
