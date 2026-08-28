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
    UserDetailPage.tsx
    partials/
      UserFormModal.tsx
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
