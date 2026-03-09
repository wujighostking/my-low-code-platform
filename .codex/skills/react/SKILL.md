---
name: "react"
description: "Use when implementing or refactoring React UI, hooks, component composition, state management, rendering performance, and component tests."
---

# React Skill

## When to use
- Build new React components, pages, or feature modules.
- Refactor complex JSX into smaller components and reusable hooks.
- Debug React rendering, state flow, and side effects.
- Improve accessibility and testability of UI logic.

## Workflow
1. Confirm the target component behavior and data flow before coding.
2. Keep components focused; extract repeated logic into hooks.
3. Prefer explicit props and single-direction data flow.
4. For async or effect-heavy logic, isolate side effects in `useEffect` and clean them up.
5. Verify accessibility basics: semantic HTML, labels, keyboard interaction, and focus behavior.
6. Add or update tests for the changed behavior.

## Engineering defaults
- Follow Hook rules strictly (top-level only, no conditional hook calls).
- Avoid unnecessary re-renders by stabilizing callbacks/objects where it matters.
- Prefer derived state over duplicated state.
- Keep business logic out of JSX when possible.

## Review checklist
- Component API is minimal and clear.
- Error/empty/loading states are handled.
- Side effects are deterministic and cleaned up.
- Tests cover user-visible behavior, not implementation details.
