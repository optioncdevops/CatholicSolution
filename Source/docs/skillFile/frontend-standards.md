# Frontend module layout

Canonical feature folder layout for CFR frontends. The agent checklist is [frontend-standards-SKILL.md](frontend-standards-SKILL.md).

## Rule

`modules/{module}/{feature}/` owns the feature. Do not put `pages`, `services`, `types`, `validator`, or `routes` on the module root.

```
src/modules/{module}/{feature}/
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
src/modules/admin/users/
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

Host router (`src/App.tsx`) imports the feature barrel:

```ts
import { usersRoutes } from '@/modules/admin/users';
```

Then renders `{usersRoutes}` inside the protected admin shell.

`index.ts` must not re-export page components (that would skip lazy loading). `routes/index.tsx` lazy-imports the pages.

## Shared module files (not a feature)

These stay on the module root:

- `components/AdminShell.tsx`
- `AdminDataContext.tsx`
- `lib/confirm.ts`
- `utils/formatDate.ts` (shared date helper)
- theme / css

New wired features (organizations, products, requests, administration) follow the same `{feature}/` tree as Users.
