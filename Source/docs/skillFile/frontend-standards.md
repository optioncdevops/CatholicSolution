# Frontend module layout

Canonical feature folder layout for CFR frontends. The agent checklist is [frontend-standards-SKILL.md](frontend-standards-SKILL.md).

## Rule

`modules/{feature}/` owns the feature. Features live **directly** under `src/modules/` — do not wrap them in an `admin` folder. Do not put `pages`, `services`, `types`, `validator`, or `routes` on the `src/modules/` root.

```
src/modules/{feature}/
  index.ts              barrel — export routes (+ types, services, utils, validator)
  pages/                list and detail (not inside partials)
    partials/           add / edit / modal
  types/
  utils/
  validator/
  services/
  routes/
```

## CFR Admin — Users

```
src/modules/users/
  index.ts
  pages/
    UsersListPage.tsx
    partials/
      AddUsers.tsx
  types/
    usersTypes.ts
  utils/
    usersHelpers.ts
  validator/
    UsersValidator.ts
  services/
    usersService.ts
  routes/
    index.tsx
```

Grouped screens (example — User Roles under Administration):

```
src/modules/administration/userRoles/
```

Host router (`src/App.tsx`) imports the feature barrel:

```ts
import { usersRoutes } from '@/modules/users';
```

Then renders `{usersRoutes}` inside the protected admin shell.

`index.ts` must not re-export page components (that would skip lazy loading). `routes/index.tsx` lazy-imports the pages.

## Shared files (not a feature)

These stay on `src/modules/` root:

- `components/AdminShell.tsx`
- `AdminDataContext.tsx`
- `lib/confirm.ts`
- `utils/formatDate.ts` (shared date helper)
- theme / css (`theme.css`, `admin.css`)
- `DashboardPage.tsx`

New wired features (organizations, products, requests, administration) follow the same `{feature}/` tree as Users, at `src/modules/{feature}/`.

## Page UX (required on every new/changed page)

These are mandatory in [frontend-standards-SKILL.md](frontend-standards-SKILL.md) sections 0.7–0.11:

- **Edit id:** pass and read `location.state` (not `?id=`).
- **Two-level routes:** `/admin/users`, `/admin/add-users`, `/admin/edit-users` — never `/admin/users/add`.
- **Unused imports:** remove unused imports and helpers from every file you touch.
- **Toast:** save, edit, delete, activate, deactivate, and load/save failures all use `showToast.success` / `showToast.error`.
- **Required fields:** Save with missing required fields shows a red ERROR toast listing each `"{Label} is required."`.
- **Placeholder:** every form control has `Enter {label}` or `Select {label}`.
- **Autofocus:** the first form control has `autoFocus`.
- **Tab order:** visual order = DOM order; no custom positive `tabIndex`.
