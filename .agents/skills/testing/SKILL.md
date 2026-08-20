---
name: testing
description: TDD rules
---

## Development workflow — STRICT TDD (always follow this order)
1. **RED**: Write a failing test first. Run test script — confirm it FAILS.
   Do NOT write implementation before this step.

2. **GREEN**: Write the minimum code to make the test pass.
   Run test script — confirm ALL tests pass.

3. **REFACTOR**: Clean up without changing behavior.
   Run tests after every change.

**Rules:**
- Never write implementation without a failing test first.
- Never write more implementation than the current test requires.
- One cycle at a time: RED → GREEN → REFACTOR before the next feature.
