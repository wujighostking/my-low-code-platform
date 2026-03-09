---
name: "antd"
description: "Use when building or refactoring UI with Ant Design in React projects, including form workflows, table interactions, theming, and accessibility."
---

# Ant Design Skill

## When to use
- Build new pages/components with Ant Design (`antd`) primitives.
- Refactor existing UI to improve consistency with Ant Design patterns.
- Implement forms, tables, modals, drawers, and validation flows.
- Adjust theme tokens and visual consistency.

## Workflow
1. Prefer existing Ant Design components before custom implementations.
2. Keep business logic separate from presentational component composition.
3. For forms, use `Form` with explicit validation and submit/error states.
4. For tables, define stable column configs and handle loading/empty/error states.
5. Ensure keyboard and screen-reader basics (labels, focus order, modal focus trap).
6. Add tests for user-visible behavior and key interactions.

## Engineering defaults
- Reuse shared wrappers/utilities where available.
- Avoid over-customizing internal Ant Design DOM structure.
- Prefer theme token configuration over one-off style overrides.
- Keep modal/drawer lifecycle explicit to avoid stale state.

## Review checklist
- UI behavior matches Ant Design interaction expectations.
- Form validation messages are clear and actionable.
- Async states are handled (`loading`, success, error, empty).
- Component API remains small and predictable.
