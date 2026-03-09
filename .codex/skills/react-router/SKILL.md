---
name: "react-router"
description: "Use when implementing routing in React apps, including route trees, nested layouts, route params/search params, navigation, and route-level data loading/error handling."
---

# React Router Skill

## When to use
- Add or modify application routes.
- Build nested layouts and route boundaries.
- Implement navigation, redirects, params, or query-string behavior.
- Add route-level loading/error handling and route tests.

## Workflow
1. Model the route tree first (parent layout, children, index routes, fallbacks).
2. Co-locate route concerns: element, loader/action (if used), and error boundary behavior.
3. Use nested routes with `Outlet` for shared layouts.
4. Handle navigation and params with router APIs (`Link`, `NavLink`, `useNavigate`, `useParams`, `useSearchParams`).
5. Ensure unknown routes have an explicit not-found experience.
6. Add tests for route rendering and key navigation flows.

## Engineering defaults
- Keep route definitions readable; avoid deeply tangled inline route objects.
- Prefer declarative navigation (`Link`/`NavLink`) over imperative navigation when possible.
- Validate and normalize route params/search params before use.
- Make loading and error states explicit at route boundaries.

## Review checklist
- Route path changes do not break existing deep links.
- Nested routes render expected parent/child layout structure.
- Redirects and guard logic avoid loops.
- Tests cover at least one happy path and one failure/not-found path.
