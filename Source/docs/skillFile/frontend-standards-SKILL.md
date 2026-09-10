---
name: frontend-standards
description: React + TypeScript frontend module coding standards (list page, then partials, then service, then backend API) using feature folders under modules/{feature} (pages, types, utils, validator, services, routes, index.ts), shared component library, react-hook-form validators, axios services, and //#region blocks. Use this skill whenever creating, changing, or reviewing ANY frontend page, module, screen, form, table, modal, route, service, type, or validator — even if the user only says "add a page", "new screen", "build a form", "add a module", or "wire this to the API".
---

# Frontend Coding Standards

Use this file as the checklist when adding or changing any module page.
Folder layout reference: [frontend-standards.md](frontend-standards.md).
Example feature used throughout: **Users** under `modules/users`. Replace `Users` / `users` with the real feature name. CFR Admin features live **directly** under `src/modules/` (`users`, `administration`, `organizations`) — there is no wrapping `admin` folder.

Every new feature follows:
```
List page (outside partials)
  -> Add / Edit / Modal (inside partials)
    -> Service (axios)
      -> Backend Controller/Action
```

## Step 0 — Discover the host app's conventions FIRST

Before writing any code, open one existing, recently-built feature in the app and mirror it:
- The shared component library location (typically `src/app/components/`) and the actual control names — use the app's equivalents of the catalog in section 14.
- Path aliases from `tsconfig` (e.g. `@app/*`, `@modules/*`).
- The partials folder spelling — new work uses `partials/` (plural); if older code uses `partial/`, do not copy that into new features.
- The service naming style already used in the module (`{feature}Service.ts` vs `{Feature}Action.ts`) — do not mix both for one feature.
- The module Index / PageShell context type name (e.g. `{Module}PageShellContext`).

---

## 0. RULES THAT NEVER CHANGE

### 0.1 Every feature MUST have these folders (under `src/modules/`)
```
src/modules/{feature}/
  pages/
  types/
  utils/
  validator/
  services/
  routes/
  index.ts
```
Example: `src/modules/users/` with those six folders plus one `index.ts`.
Grouped screens (User Roles) live at `src/modules/administration/userRoles/`.
Create all six even if `utils` starts with one small helper file.
Do not skip `types` or `validator` and put interfaces / rules inside the page.
Do not put `pages` / `services` / `types` on the `src/modules/` root (`modules/pages`). They belong inside the feature folder.
Do not wrap features in `modules/admin/` — that folder was removed.

### 0.2 components/ is OPTIONAL
Add module components ONLY when the UI cannot be built from the app's shared controls (form controls, buttons, data table, modal, card).
Do not duplicate `InputField`, `Dropdown`, `CommonButton`, or `CustomDataTable` inside the module.

### 0.3 List vs add / edit / modal
- List page = **outside** the partials folder
- Add page = **inside** `partials/`
- Edit page = **inside** `partials/` (same file as Add when it is one form)
- Modal = **inside** `partials/`
- Extra table / filter bar used only by that feature = **inside** `partials/`

Folder name is `partials/` (plural).

### 0.4 Pages MUST use the app's shared common controls
| Purpose | Control |
|---|---|
| Forms | `InputField`, `Dropdown`, `TextareaField`, `RadioGroup`, `DatePicker`, ... |
| Buttons | `CommonButton`, `CommonIconButton` |
| Table | `CustomDataTable` |
| Modal | `BaseModal` |
| Confirm | `showDeleteConfirm` / `CommonAlertDialog` |
| Toast | `showToast` |
| Card | `CommonCard` |
| Actions | `.admin-sticky-footer` div (page) / modal `footer` prop (dialog) — see section 0.4a |
| Layout | `PageShell`, `PageNote`, `PageHeader` |

Do not use raw `<input>`, `<select>`, `<button>`, or add a new table library.
(If the host app names these controls differently, use its equivalents — never raw HTML controls.)

### 0.4a Save / Cancel button pair — terminology, order, alignment (MUST)

Every form-style Save/Cancel pair in the app (add/edit pages, modals, bulk-edit toolbars) MUST look and behave identically. This is confirmed against every existing add/edit page and modal in CFR Admin (Users, Organizations, Email Settings, User Roles, Product license/assign modals) — do not invent a variant.

**Terminology** — the pair is exactly **`Cancel`** and **`Save`**. Never substitute:
- `Discard`, `Reset`, `Close`, `Go Back` for Cancel
- `Save Changes`, `Update`, `Submit`, `Apply` for Save

A domain-specific primary action that is genuinely not a generic save (`Approve`, `Reject`, `Activate`) may replace the Save label — but the button next to it is still exactly `Cancel`, never `Close`/`Discard`.

**Order** — Cancel first, Save second, in that DOM order (both visually and in markup):
```tsx
<CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={handleCancel} disabled={saving}>Cancel</CommonButton>
<CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={saving} disabled={saving}>Save</CommonButton>
```
- Cancel: `variant="outline"`, `iconLeft={<X size={14} />}` on page-level forms (icon is optional inside a modal footer that already has its own close X in the header — do not add it there if the modal component already renders one).
- Save: `variant="primary"`, `iconLeft={<Save size={14} />}`, `loading={saving}` while the request is in flight.
- Both: `size="sm"` on page-level forms (modals may omit `size` to match the modal's own default).

**Alignment**
- Page-level add/edit form: wrap the pair in `<div className="admin-sticky-footer">` (defined in `modules/admin.css`) — a sticky bar pinned to the bottom of the scrollable form, buttons centered by default. Do not build a bespoke fixed/absolute footer.
- A page-level footer that also needs to show a status string (e.g. an unsaved-change count) may override alignment with `className="admin-sticky-footer flex items-center justify-between gap-3"` — status text on the left, the Cancel/Save pair grouped together on the right, still in Cancel-then-Save order.
- Modal: pass the pair through the modal's `footer` prop; do not add a `justify-end` wrapper unless the modal component doesn't already right-align its footer.

Do not reference a `FormActionsBar` component — it does not exist in this codebase. Use the patterns above.

### 0.5 Pages MUST use `//#region` blocks
See section 10. Required on list pages, add/edit pages, and modals.

### 0.6 Default export for route pages
```tsx
export default CustomerDirectory;
```
Named exports are OK for types, validators, utils, and small presentational pieces.

### 0.7 Edit identity MUST use `location.state`
- Pass the record id (and any other edit payload) with `navigate(..., { state: { id } })`.
- Read it with `useLocation().state`. Type the state (host `EditLocationStateParams`, or a feature type).
- Do **not** put the edit id on the query string (`?id=`), as a third path segment (`/admin/users/edit`), or in module context just to avoid `state`.
- Add and edit may share one form in `partials/`. Add = no state (or `id` missing). Edit = `location.state.id` present.

### 0.8 Toast on EVERY page-level action (MUST)
Every user action on a list, detail, add/edit page, or modal MUST show a toaster. Use `showToast` from `@app/components/common/CustomToastMessage` (`showToast.success` / `showToast.error` / `showToast.warning`).

| Action | Toast |
|---|---|
| Add / save success | `showToast.success("{Feature} added successfully.")` |
| Edit / update success | `showToast.success("{Feature} updated successfully.")` |
| Delete success | confirm first, then `showToast.success("{Feature} deleted successfully.")` |
| Activate | `showToast.success("{Name} activated.")` |
| Deactivate / inactive | `showToast.success("{Name} deactivated.")` |
| Load / save / delete / status failure | `showToast.error("...")` |
| Required fields missing on Save | `showToast.error` listing **each** `"{Label} is required."` (red ERROR toast). Do not save. |

Do not use `window.alert`. Do not skip the toast because the inline field error is visible. Required-field failures still toast.

### 0.9 Form controls: placeholder, autofocus, tab order (MUST)
On every add / edit page and modal:
- Every `InputField`, `TextareaField`, `Dropdown` (and the same for DatePicker / other form controls) MUST have a **placeholder**. Text: `Enter {label in sentence case}`. Dropdown: `Select {label in sentence case}`.
- The **first** focusable form control MUST have `autoFocus`.
- Tab order MUST follow visual order. Do not set `tabIndex={1}` / `{2}` / … . Do not set `tabIndex={-1}` on a field the user should tab into. Put fields in DOM order that matches the layout.

### 0.10 Admin routes MUST be two levels (MUST)
CFR Admin URLs under `/admin` are **two segments only**. Do not nest add/edit under the list path.

| Page | YES | NO |
|---|---|---|
| List | `/admin/users` | |
| Add | `/admin/add-users` | `/admin/users/add` |
| Edit | `/admin/edit-users` | `/admin/users/edit` |

Pattern:
- List = `/admin/{feature}`
- Add = `/admin/add-{feature}`
- Edit = `/admin/edit-{feature}`

Same rule for grouped screens: `/admin/administration-user-roles` is already two levels; an add page would be `/admin/add-user-roles`, not `/admin/administration-user-roles/add`.

Do **not** use relative `"add"` / `"edit"` children of the list route. Pass edit identity in `location.state` (rule 0.7) on `/admin/edit-{feature}`.

### 0.11 Unused imports MUST be removed
When creating or changing any page, partial, service, type, validator, or util file, remove unused imports, unused variables, and unused types before finishing. Do not keep an import "for later". Use `import type` only for type-only symbols. If a helper is no longer called, delete it from the util file too.

### Stable Control IDs

Every interactive or testable UI control must have a stable `id`.

**Required controls:**
- Text inputs
- Textareas
- Dropdowns/selects
- Date pickers
- Checkboxes
- Radio buttons
- Buttons
- Icon buttons
- Navigation links
- Menus
- Menu items
- Tabs
- Tables
- Table rows where interaction exists
- Modals/dialogs
- Form sections
- Charts when they have interactions
- Search and filter controls
- Pagination controls
- Upload controls

**IDs must:**
- Be unique within the rendered page
- Be deterministic (same control -> same id on every render, every session)
- Use the feature and control purpose (`txtOrganizationName`, not `txtInput1`)
- Remain stable between renders — do not derive an id from `Math.random()`, `crypto.randomUUID()`, `Date.now()`, or a loop index
- Not depend on database IDs unless the record identity is genuinely required (a table row, a per-record modal) — a static field on a form does not need one
- Not contain spaces
- Use PascalCase for the control-name portion after the prefix
- Use the approved prefix catalog below

Do not use a random id, an array index, a generated UUID, a timestamp, or the control's visible text as the only identifier.

**Approved ID prefixes**

| Control | Prefix | Example |
|---|---|---|
| Textbox/input | `txt` | `txtOrganizationName` |
| Textarea | `txta` | `txtaDescription` |
| Dropdown/select | `ddl` | `ddlOrganizationStatus` |
| Date picker | `dtp` | `dtpStartDate` |
| Checkbox | `chk` | `chkIsActive` |
| Radio button | `rdo` | `rdoLicenseTypeAnnual` |
| Button | `btn` | `btnSaveOrganization` |
| Icon button | `ibtn` | `ibtnRefreshDashboard` |
| Link | `lnk` | `lnkViewOrganizations` |
| Menu | `menu` | `menuAdministration` |
| Menu item | `menuItem` | `menuItemOrganizations` |
| Tab | `tab` | `tabOrganizationUsers` |
| Search field | `txtSearch` | `txtSearchOrganizations` |
| Filter | `filter` | `filterRequestStatus` |
| Table | `tbl` | `tblOrganizations` |
| Table row | `row` | `rowOrganization123` |
| Modal/dialog | `dlg` | `dlgConfirmDeleteOrganization` |
| Form | `form` | `formOrganization` |
| Section | `section` | `sectionOrganizationProducts` |
| Chart | `chart` | `chartRequestTrend` |
| Pagination | `pagination` | `paginationOrganizations` |
| File upload | `file` | `fileProductLogo` |
| Toast region | `toast` | `toastDashboard` |

For a row/record-scoped id, append the record's real identity (not the array index): `rowOrganization123` for `OrgId = 123`, `menuItemOrganizations` for a fixed nav entry (no record identity involved, so no number is appended).

Usage — pass `id` straight through the shared control, the same way `name`/`label`/`rules` are already passed:
```tsx
<InputField id="txtOrganizationName" control={control} name="orgName" label="Organization Name" />
<Dropdown id="ddlOrganizationStatus" control={control} name="orgStatus" label="Status" options={statusOptions} />
<DatePicker id="dtpStartDate" control={control} name="startDate" label="Start Date" />
<CommonCheckbox id="chkIsActive" control={control} name="isActive" label="Active" />
<CommonButton id="btnSaveOrganization" type="submit">Save</CommonButton>
<CommonIconButton id="ibtnRefreshDashboard" aria-label="Refresh dashboard" icon={<RefreshCw />} onClick={handleRefresh} />
<Link id="lnkViewOrganizations" to="/admin/organizations">View all</Link>
<BaseModal id="dlgConfirmDeleteOrganization" isOpen={isOpen} onClose={onClose} title="Delete organization?">...</BaseModal>
```

If a shared control does not yet accept/forward an `id` prop, add that prop to the control (forwarded onto its underlying DOM element) rather than reaching past it with a raw HTML attribute or a wrapping `<div id=...>` that doesn't reach the actual interactive element.

Do not skip this rule "because it's just a dashboard" or "just an internal tool" — stable ids are what let QA automation, accessibility tooling, and analytics target a specific control reliably across releases.

---

## 1. APP FOLDERS (do not recreate these inside a module)

```
src/
  app/
    components/          SHARED UI — always import from here
      formControls/      InputField, Dropdown, DatePicker, RadioGroup, ...
      buttons/           CommonButton, CommonIconButton
      dataTable/         CustomDataTable, CustomServerSideDataTable
      common/            PageHeader, PageNote, CustomToastMessage,
                         CommonAlertDialog, ButtonNavigation, DetailGrid
      modal/             BaseModal, ConfirmationPopup
      cards/             CommonCard, FormSectionCard
      layout/            PageShell
      loader/            CardLoader, ContentLoader
    config/              AxiosInstance
    pages/types/         CommonTypes (ApiResponse, DropdownOption, RadioOption)
    validation/          validationMessages (FIELD_REQUIRED)
    utilities/           cn, phoneMask, CommonMethods, htmlPlainText
    routes/              AppNavigator — registers every module routes file
    hooks/               useAuth and other app-wide hooks
  modules/
    {feature}/           one folder per feature (users, administration, …)
  designSystem/          theme, MainLayout, top navbar — do not put feature UI here
```

Path aliases (from `tsconfig`):
```
@app/*          src/app/*
@modules/*      src/modules/*
@designSystem/* src/designSystem/*
@/*             src/*
```

- Import common UI from `@app/components/...`
- Import the current feature with relative paths (`../services`, `../types`)
- Import another feature/module with `@modules/{feature}` or the feature `index.ts`
- App / host router imports `{feature}Routes` from the feature `index.ts`

---

## 2. MODULE FOLDER LAYOUT

A **feature** is one screen group (`users`, `organizations`, `administration`). Features live **directly** under `src/modules/` — there is no wrapping `admin` folder.
Shared chrome (shell, theme, confirm helper) stays on `src/modules/` root. Feature code does **not**.

```
src/modules/
  {feature}/                          REQUIRED — one folder per feature (users, organizations, …)
    index.ts                          REQUIRED — barrel: export routes (+ types/services/utils/validator)
    pages/                            REQUIRED
      {Feature}ListPage.tsx           LIST PAGE — not inside partials
      {Feature}DetailPage.tsx         DETAIL PAGE — not inside partials
      partials/                       ADD, EDIT, MODAL, extra pieces
        {Feature}FormModal.tsx
        Add{Feature}.tsx
    types/                            REQUIRED
      {feature}Types.ts
    utils/                            REQUIRED
      {feature}Helpers.ts
    validator/                        REQUIRED  (folder name is validator, not validators)
      {Feature}Validator.ts
    services/                         REQUIRED
      {feature}Service.ts
    routes/                           REQUIRED
      index.tsx                       feature <Route> elements; App imports from index.ts
    components/                       OPTIONAL
    hooks/                            OPTIONAL
    context/                          OPTIONAL
```

**CFR Admin example — Users:**
```
modules/users/
  index.ts
  pages/
    UsersListPage.tsx
    UserDetailPage.tsx
    partials/
      UserFormModal.tsx
  types/usersTypes.ts
  utils/usersHelpers.ts
  validator/UsersValidator.ts
  services/usersService.ts
  routes/index.tsx
```

**Example — list with an add/edit page:**
```
modules/{feature}/
  index.ts
  pages/
    {Feature}ListPage.tsx
    partials/
      Add{Feature}.tsx
      {Feature}Table.tsx
  types/{feature}Types.ts
  utils/{feature}Helpers.ts
  validator/{Feature}Validator.ts
  services/{feature}Service.ts
  routes/index.tsx
```

**WRONG:**
- `modules/admin/users/` (do not wrap features in an `admin` folder)
- `modules/pages/users/` plus `modules/services/` (feature folders split across the modules root)
- `{Feature}ListPage.tsx` sitting directly in `modules/users/` with no `pages/` folder
- `UserFormModal.tsx` sitting next to the list page (not in `partials/`)
- types defined inside the page
- validation rules written inline on `InputField` with no validator file
- a local `<button>` instead of `CommonButton`
- skipping `index.ts` or `routes/`

---

## 3. NAMING

| Piece | Name |
|---|---|
| Module folder | kebab / camel case, match existing modules |
| List page | `CustomerDirectory.tsx`, `SystemMessages.tsx` |
| Add / edit page | `AddCustomerDirectory.tsx`, `{Feature}FormPage.tsx` |
| Modal | `AddCustomerDirectoryModal.tsx` |
| Service | `{feature}Service.ts` preferred for new files (`{Feature}Action.ts` if the module already uses that style — do not mix both for one feature) |
| Types | `{feature}Types.ts` |
| Validator | `{Feature}Validator.ts` |
| Utils | `{feature}Helpers.ts` / `normalize{Feature}.ts` |
| Route path | Two levels under `/admin`: list `/admin/{feature}`, add `/admin/add-{feature}`, edit `/admin/edit-{feature}` |
| Child routes | Do not nest `/add` or `/edit` under the list path |

- Component names: **PascalCase**
- Functions / files for services and utils: **camelCase**
- Types / interfaces: **PascalCase** — `CustomerDirectoryApiItem`, `CustomerDirectoryFormValues`

---

## 4. CHECKLIST (DO IN THIS ORDER)

1. `{feature}/types/{feature}Types.ts` — API item + form values + defaultValues
2. `{feature}/validator/{Feature}Validator.ts` — rules using `FIELD_REQUIRED`
3. `{feature}/services/{feature}Service.ts` — GET / POST / PUT / DELETE
4. `{feature}/utils/{feature}Helpers.ts` — normalize API -> UI if the payload is nested
5. `{feature}/pages/{Feature}ListPage.tsx` — LIST page with `#region`
6. `{feature}/pages/partials/Add...` — ADD / EDIT / MODAL with `#region`
7. `{feature}/routes/index.tsx` — list + detail/add/edit routes
8. `{feature}/index.ts` — export `{feature}Routes` (and types/services/utils/validator)
9. Host router (`App.tsx` or `app/routes`) — `{feature}Routes` from the feature index
10. `components/` — ONLY if common controls are not enough

Then verify UX (section 0.7–0.11): `location.state` for edit, two-level routes (`/admin/add-users`, `/admin/edit-users`), toast on save/edit/delete/activate/inactive, ERROR toast on required fields, placeholder on every control, `autoFocus` on the first control, natural tab order, unused imports removed.

---

## 5. TYPES

File: `modules/{feature}/types/{feature}Types.ts`

Put: API row shape from `resultData`, form values for react-hook-form, `defaultValues` constant (or keep `defaultValues` in the validator — pick one place).
Do not: declare interfaces inside the page, or use `any` for `resultData` — cast to the type from this file.

```ts
export interface CustomerDirectoryApiItem {
  ID: number;
  CustomerEMailAddress: string;
  MappedOrgID: string | null;
}

export interface CustomerDirectoryFormValues {
  txtEmailaddress: string;
}
```

Shared API envelope lives in app, not in the module:
```ts
import type { ApiResponse, ApiError, DropdownOption, RadioOption } from "@app/pages/types/CommonTypes";
// ApiResponse<T> = { statusCode, statusMessage, resultData }
```

---

## 6. VALIDATOR

File: `modules/{feature}/validator/{Feature}Validator.ts`

Always import `FIELD_REQUIRED` from `@app/validation/validationMessages`.
Export a rules object used by `InputField` / `Dropdown` / `DatePicker` via `rules={...}`.
Export `defaultValues` if they are not in types.

```ts
import { FIELD_REQUIRED } from "@app/validation/validationMessages";
import type { CustomerDirectoryFormValues } from "../types/customerDirectoryTypes";

export const customerDirectoryDefaultValues: CustomerDirectoryFormValues = {
  txtEmailaddress: "",
};

export const customerDirectoryRules = {
  txtEmailaddress: {
    required: "E-Mail Address is required.",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address.",
    },
  },
};
```

Page usage: `rules={customerDirectoryRules.txtEmailaddress}`

Required-rule **message** MUST name the field so the ERROR toast can list it:
```ts
firstName: { required: "First name is required." },
```
Do not use a generic `"This field is required."` for required rules (the toast would not tell the user which field).
`FIELD_REQUIRED` is still fine as a fallback only when the host already uses it AND you map field names to labels in `onInvalid`.

Do not copy the required message as a raw string on every field **except** the labeled `"{Label} is required."` pattern above.
Do not put validator logic inside the service.

---

## 7. SERVICE

File: `modules/{feature}/services/{feature}Service.ts`

Rules:
- Use `axiosInstance` from `@app/config/AxiosInstance`
- URL = `"{Controller}/{Action}"` matching the backend `APIActionName`
- Return `ApiResponse`
- try/catch — rethrow a string message
- One exported function per backend action
- GET params in `{ params: { ... } }`; POST JSON body as the data argument; DELETE with `{ params: { Id: id } }`

```ts
import axiosInstance from "@app/config/AxiosInstance";
import type { ApiError, ApiResponse } from "@app/pages/types/CommonTypes";
import type { CustomerDirectoryFormValues } from "../types/customerDirectoryTypes";

const controller = "CustomerDirectory";

export const getCustomerDirectory = async (): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.get<ApiResponse>(`${controller}/GetCustomerDirectory`);
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.message || err.response?.resultData || "Failed to load customer directory";
  }
};

export const saveCustomerDirectory = async (value: CustomerDirectoryFormValues): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.post<ApiResponse>(`${controller}/SaveCustomerDirectory`, value);
    return response.data;
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.message || "Failed to save customer directory";
  }
};

export const deleteCustomerDirectory = async (id: number): Promise<ApiResponse> => {
  try {
    const response = await axiosInstance.delete<ApiResponse>(`${controller}/DeleteCustomerDirectory`, {
      params: { Id: id },
    });
    const { statusCode, statusMessage, resultData } = response.data;
    return { statusCode, statusMessage, resultData };
  } catch (error: unknown) {
    const err = error as ApiError;
    throw err.message || err.response?.resultData || "Failed to delete customer directory";
  }
};
```

Do not call axios from the page.
Do not hard-code the API host or a gateway service prefix (`/acutis`, `/portal`). Env only has `VITE_APP_REST_API_BASE_URL` (gateway origin, e.g. `https://localhost:5050`). Service paths (`/acutis/api/v1/`, `/portal/api/v1/`) live in `src/app/config/gateway.ts` (`GATEWAY_SERVICES`). `AxiosInstance` (Admin) and `appAcutisClient` / `appPortalClient` (CFR) already use that. To add a microservice: add it to `Gateway:Services` in CFR.Gateway appsettings and add a matching key on `GATEWAY_SERVICES`, then call `getServiceApiBaseUrl('newService')`.

---

## 8. UTILS

File: `modules/{feature}/utils/{feature}Helpers.ts`

Use utils for: normalizing nested API payloads into a flat UI row; date / phone / URL formatting specific to this feature; column builders that would make the list page too long; mapping `resultData` to `DropdownOption[]`.

Keep generic helpers in `@app/utilities` (cn, phoneMask, date formatting).
Do not put JSX in utils unless it is a column factory that already exists in the module.

```ts
import type { CustomerDirectoryApiItem } from "../types/customerDirectoryTypes";

export const normalizeCustomerDirectoryList = (resultData: unknown): CustomerDirectoryApiItem[] => {
  if (!Array.isArray(resultData)) {
    return [];
  }
  return resultData as CustomerDirectoryApiItem[];
};
```

---

## 9. ROUTES

File: `modules/{feature}/routes/index.tsx`

List and detail/add/edit routes live in the feature. Lazy-load pages here. Export `{feature}Routes` from `{feature}/index.ts`.

```tsx
import { lazy } from "react";
import { Route } from "react-router-dom";

const UsersListPage = lazy(() => import("../pages/UsersListPage"));
const AddUsers = lazy(() => import("../pages/partials/AddUsers"));

export const usersRoutes = (
  <>
    <Route path="/admin/users" element={<UsersListPage />} />
    <Route path="/admin/add-users" element={<AddUsers />} />
    <Route path="/admin/edit-users" element={<AddUsers />} />
  </>
);
```

`{feature}/index.ts` (one barrel file — required):
```ts
export { usersRoutes } from "./routes";
export * from "./services/usersService";
export * from "./types/usersTypes";
export * from "./utils/usersHelpers";
export * from "./validator/UsersValidator";
```
Do not re-export pages from `index.ts` (that would break lazy loading). Routes already lazy-import pages.

Register in the host router (`src/App.tsx` or `src/app/routes/index.tsx`):
```tsx
import { usersRoutes } from "@/modules/users";
// inside the protected layout:
{usersRoutes}
```

Navigate to add / edit — two-level paths only (rule 0.10):
```tsx
navigate("/admin/users")
navigate("/admin/add-users")
navigate("/admin/edit-users", { state: { id: row.userId } })
```

Do **not**:
```tsx
navigate("add")
navigate("/admin/users/add")
navigate("/admin/users/edit", { state: { id } })
```

Read it on the add/edit page:
```tsx
const location = useLocation();
const id = (location.state as { id?: number } | undefined)?.id;
```

Pass edit id through `location.state`, not a query string, and not a third URL segment.
Wrap feature routes with the existing module shell (`AdminShell`, `MainLayout`, `PageShell`) the same way the host app already does.

---

## 10. PAGE REGIONS (REQUIRED)

Use `//#region Name` and `//#endregion` inside every page and every partial (same idea as C# `#region` on the backend).

**LIST PAGE region order:**
```
//#region Hooks
//#endregion

//#region States
//#endregion

//#region Form          (only if the list has a filter form)
//#endregion

//#region Functions
//#endregion

//#region Effects
//#endregion

//#region Handlers
//#endregion

//#region Columns
//#endregion

//#region Render
```

**ADD / EDIT / MODAL region order:**
```
//#region Hooks
//#endregion

//#region States
//#endregion

//#region Form
//#endregion

//#region Functions
//#endregion

//#region Effects
//#endregion

//#region Handlers
//#endregion

//#region Render
```

Rules:
- Comment is `//#region` (not `/* #region */`)
- Close every region with `//#endregion`
- Do not nest regions unless the file is very large
- Do not keep regions that have no code — omit that region instead
- Put column defs in `//#region Columns`, not inline in JSX

---

## 11. LIST PAGE TEMPLATE

File: `{feature}/pages/{Feature}ListPage.tsx` (OUTSIDE partials)

```tsx
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { CustomDataTable } from "@app/components/dataTable/partials/CustomDataTable";
import type { ColumnDef } from "@app/components/dataTable/partials/useDataTable";
import { showToast } from "@app/components/common/CustomToastMessage";
import { showDeleteConfirm } from "@app/components/common/CommonAlertDialog";
import { CommonButton, CommonIconButton } from "@app/components/buttons";
import { PageNote } from "@app/components/common/PageNote";
import { Trash2 } from "lucide-react";
import { getCustomerDirectory, deleteCustomerDirectory } from "../services/customerDirectoryService";
import type { CustomerDirectoryApiItem } from "../types/customerDirectoryTypes";
import { normalizeCustomerDirectoryList } from "../../utils/customerDirectoryHelpers";
import type { ModulePageShellContext } from "../{Module}Index";

const CustomerDirectory = () => {
  //#region Hooks
  const navigate = useNavigate();
  const { setPageActions } = useOutletContext<ModulePageShellContext>();
  //#endregion

  //#region States
  const [rows, setRows] = useState<CustomerDirectoryApiItem[]>([]);
  const [loading, setLoading] = useState(true);
  //#endregion

  //#region Functions
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { resultData } = await getCustomerDirectory();
      setRows(normalizeCustomerDirectoryList(resultData));
    } catch (error) {
      console.error("Error loading customer directory:", error);
      showToast.error("Failed to load customer directory.");
    } finally {
      setLoading(false);
    }
  }, []);
  //#endregion

  //#region Effects
  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setPageActions(
      <CommonButton size="xs" onClick={() => navigate("/admin/add-users")}>
        Add New Email Address
      </CommonButton>,
    );
    return () => setPageActions(undefined);
  }, [navigate, setPageActions]);
  //#endregion

  //#region Handlers
  const handleDelete = useCallback(
    async (id: number) => {
      const result = await showDeleteConfirm("customer");
      if (!result.isConfirmed) {
        return;
      }
      try {
        await deleteCustomerDirectory(id);
        showToast.success("Customer deleted successfully.");
        await load();
      } catch (error) {
        console.error("Error deleting customer:", error);
        showToast.error("Failed to delete customer.");
      }
    },
    [load],
  );
  //#endregion

  //#region Columns
  const columns: ColumnDef<CustomerDirectoryApiItem>[] = useMemo(
    () => [
      {
        id: "action",
        header: "Action",
        exportable: false,
        accessor: () => "",
        sortable: false,
        filterable: false,
        width: "120px",
        cell: (row) => (
          <div className="flex items-center justify-center gap-1.5">
            <CommonIconButton title="Delete" aria-label="Delete" variant="primary" tone="soft" size="sm" iconComponent={Trash2} onClick={() => handleDelete(row.ID)} />
          </div>
        ),
      },
      {
        id: "serialNo",
        header: "S.No",
        exportable: false,
        accessor: () => "",
        cell: (_row, index) => <>{String(index + 1)}</>,
        sortable: false,
        width: "72px",
      },
      {
        id: "CustomerEMailAddress",
        header: "E-Mail Address",
        accessor: (row) => row.CustomerEMailAddress ?? "",
        sortable: true,
      },
    ],
    [handleDelete],
  );
  //#endregion

  //#region Render
  return (
    <div className="space-y-4">
      <PageNote>Email addresses in this list can be used as usernames for more than one account.</PageNote>
      <CustomDataTable<CustomerDirectoryApiItem>
        columns={columns}
        data={rows}
        rowKey={(r) => r.ID}
        loading={loading}
        exportFileName="Customer Directory"
      />
    </div>
  );
  //#endregion
};

export default CustomerDirectory;
```

List page rules:
- Fetch in Functions + Effects, not in Render
- Page toolbar buttons go through `setPageActions` on the module Index shell
- Delete uses `showDeleteConfirm` then the service then `showToast` then reload
- `rowKey` must be stable (id), never the array index
- Action column uses `CommonIconButton`, not a raw icon button

---

## 12. ADD / EDIT PAGE TEMPLATE (INSIDE partials)

File: `{feature}/pages/partials/Add{Feature}.tsx`

Use `CommonCard` + form controls + a `.admin-sticky-footer` Cancel/Save row (rule 0.4a). Same file handles add and edit when the form is identical (read id from `location.state`).

```tsx
import { useCallback, useEffect, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { CommonCard } from "@app/components/cards/CommonCard";
import { CommonButton } from "@app/components/buttons";
import { showToast } from "@app/components/common/CustomToastMessage";
import { InputField, MandatoryIndicator } from "@app/components/formControls";
import { Save, X } from "lucide-react";
import { getCustomerDirectoryById, saveCustomerDirectory } from "../../services/customerDirectoryService";
import type { CustomerDirectoryFormValues } from "../../types/customerDirectoryTypes";
import { customerDirectoryDefaultValues, customerDirectoryRules } from "../../validator/CustomerDirectoryValidator";
import type { EditLocationStateParams } from "@app/pages/types/CommonTypes";

const AddCustomerDirectory = () => {
  //#region Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const id = (location.state as EditLocationStateParams | undefined)?.Id;
  //#endregion

  //#region States
  const [loading, setLoading] = useState(false);
  //#endregion

  //#region Form
  const { control, handleSubmit, reset } = useForm<CustomerDirectoryFormValues>({
    defaultValues: customerDirectoryDefaultValues,
    mode: "onChange",
  });
  //#endregion

  //#region Functions
  const loadData = useCallback(async (recordId: number) => {
    try {
      const { resultData } = await getCustomerDirectoryById(recordId);
      if (resultData) {
        reset(resultData as CustomerDirectoryFormValues);
      }
    } catch (error) {
      console.error("Error loading customer directory details:", error);
      showToast.error("Failed to load details.");
    }
  }, [reset]);
  //#endregion

  //#region Effects
  useEffect(() => {
    if (id) {
      void loadData(id);
    }
  }, [id, loadData]);
  //#endregion

  //#region Handlers
  const navigateToList = () => {
    navigate("/customer-directory", { replace: true });
  };

  const onInvalid = (formErrors: FieldErrors<CustomerDirectoryFormValues>) => {
    const messages = Object.values(formErrors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    showToast.error(messages.join("\n") || "Please fill in the required fields.");
  };

  const onSubmit = async (values: CustomerDirectoryFormValues) => {
    setLoading(true);
    try {
      await saveCustomerDirectory(values);
      showToast.success(`Customer directory ${id ? "updated" : "added"} successfully.`);
      navigateToList();
    } catch (error) {
      console.error("Error saving customer directory:", error);
      showToast.error("Failed to save customer directory.");
    } finally {
      setLoading(false);
    }
  };
  //#endregion

  //#region Render
  return (
    <CommonCard title={id ? "Edit Email Address" : "Add Email Address"} headerStyle="brand" cardVariant="ghost" actions={<MandatoryIndicator />}>
      <form noValidate onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="col-span-12 md:col-span-6">
            <InputField
              control={control}
              name="txtEmailaddress"
              label="E-Mail Address"
              type="email"
              placeholder="Enter email address"
              autoFocus
              required
              maxLength={100}
              rules={customerDirectoryRules.txtEmailaddress}
              disabled={loading}
            />
          </div>
        </div>
        <div className="admin-sticky-footer">
          <CommonButton type="button" variant="outline" size="sm" iconLeft={<X size={14} />} onClick={navigateToList} disabled={loading}>
            Cancel
          </CommonButton>
          <CommonButton type="submit" variant="primary" size="sm" iconLeft={<Save size={14} />} loading={loading} disabled={loading}>
            Save
          </CommonButton>
        </div>
      </form>
    </CommonCard>
  );
  //#endregion
};

export default AddCustomerDirectory;
```

Form layout:
- `grid grid-cols-1 gap-6 md:grid-cols-12`; fields use `col-span-12 md:col-span-3|4|6`
- Cancel / Save live in `<div className="admin-sticky-footer">`, Cancel first, Save second (rule 0.4a)
- `required` on the control AND `rules` from the validator (`"{Label} is required."`)
- `placeholder` on every control (`Enter …` / `Select …`)
- `autoFocus` on the **first** control only
- Tab order = DOM order (no positive `tabIndex`)
- `form noValidate` — HTML5 native bubbles are off; react-hook-form shows inline errors **and** `handleSubmit(onValid, onInvalid)` shows the ERROR toast
- Edit id comes from `location.state`, not the query string

---

## 13. MODAL TEMPLATE (INSIDE partials)

When add/edit is a dialog on top of the list (not a separate route): list stays in `{Feature}.tsx`; modal lives in `partials/{Feature}Modal.tsx`; list imports the modal and passes `isOpen` / `onClose` / `onSaved`.

```tsx
import { useForm, type FieldErrors } from "react-hook-form";
import { BaseModal } from "@app/components/modal/BaseModal";
import { CommonButton } from "@app/components/buttons";
import { InputField } from "@app/components/formControls";
import { showToast } from "@app/components/common/CustomToastMessage";
import { saveCustomerDirectory } from "../../services/customerDirectoryService";
import type { CustomerDirectoryFormValues } from "../../types/customerDirectoryTypes";
import { customerDirectoryDefaultValues, customerDirectoryRules } from "../../validator/CustomerDirectoryValidator";

type AddCustomerDirectoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

const AddCustomerDirectoryModal = ({ isOpen, onClose, onSaved }: AddCustomerDirectoryModalProps) => {
  //#region Form
  const { control, handleSubmit, reset } = useForm<CustomerDirectoryFormValues>({
    defaultValues: customerDirectoryDefaultValues,
  });
  //#endregion

  //#region Handlers
  const onSubmit = async (values: CustomerDirectoryFormValues) => {
    try {
      await saveCustomerDirectory(values);
      showToast.success("Customer added successfully.");
      reset(customerDirectoryDefaultValues);
      onClose();
      await onSaved();
    } catch (error) {
      console.error("Error saving customer:", error);
      showToast.error("Failed to save customer.");
    }
  };

  const onInvalid = (formErrors: FieldErrors<CustomerDirectoryFormValues>) => {
    const messages = Object.values(formErrors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));
    showToast.error(messages.join("\n") || "Please fill in the required fields.");
  };
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Email Address"
      size="md"
      footer={
        <>
          <CommonButton variant="outline" onClick={onClose}>Cancel</CommonButton>
          <CommonButton variant="primary" onClick={handleSubmit(onSubmit, onInvalid)}>Save</CommonButton>
        </>
      }
    >
      <InputField control={control} name="txtEmailaddress" label="E-Mail Address" type="email" placeholder="Enter email address" autoFocus required rules={customerDirectoryRules.txtEmailaddress} />
    </BaseModal>
  );
  //#endregion
};

export default AddCustomerDirectoryModal;
```

When to use a route vs a modal:
- **Modal** — short form, 1–3 fields, user should stay on the list
- **Add page** — long form, files, rich text, tabs — use a child route

---

## 14. COMMON CONTROLS CATALOG (use these, do not rebuild)

Import from `@app/components/formControls` (barrel) unless noted. If the host app's shared library uses different names, use its equivalents for the same purpose.

**Forms:** `InputField` (text, email, password, number), `TextareaField`, `Dropdown` (options: `DropdownOption[]` `{ id, value }`), `ServerSideDropdown` (large lists fetched from API), `MultiSelect` / `MultiSelectAdd`, `RadioGroup`, `CommonSwitch`, `CommonCheckbox`, `CheckboxGroup`, `DatePicker` / `TimePicker` / `DateTimePicker` / `DateRangePicker` / `MonthPicker` / `YearRangePicker`, `RichTextEditor`, `FileUpload` / `FileInputField` / `DetailedFileUpload` / `ExcelUpload` / `MultiImageUpload`, `MandatoryIndicator` (put in `CommonCard` actions), `TreeView` / `NavigationTreeView`

**Buttons** (`@app/components/buttons`): `CommonButton` (variant: primary | secondary | success | danger; size: xs | sm | md), `CommonIconButton` (table row actions with Pencil, Trash2, Eye, Copy)

**Table:** `CustomDataTable` + `ColumnDef` (`@app/components/dataTable/partials/...`), `CustomServerSideDataTable` when the API pages the data

**Feedback:** `showToast.success` / `showToast.error` (`@app/components/common/CustomToastMessage`), `showDeleteConfirm` (`@app/components/common/CommonAlertDialog`), `CardLoader` (`@app/components/loader`)

**Layout:** `PageShell` (module Index), `PageHeader` / `PageNote`, `.admin-sticky-footer` (Cancel / Save row — rule 0.4a), `CommonCard` (add/edit forms), `ButtonNavigation` (module section tabs), `MenuTabBar` (in-page tabs), `BaseModal` (dialogs), `DetailGrid` (read-only detail view)

**Icons:** `lucide-react` — Pencil, Trash2, Eye, Copy, Plus

Do not import SweetAlert2 or another alert library. Confirmations go through `CommonAlertDialog`.

---

## 15. MODULE INDEX / PAGE SHELL

Each module has an Index page (`{Module}Index`) that wraps child routes with `PageShell` + `ButtonNavigation` and exposes:
```tsx
export type {Module}PageShellContext = {
  setPageActions: (actions?: ReactNode) => void;
};
```

List pages set the header action button through that context:
```tsx
const { setPageActions } = useOutletContext<{Module}PageShellContext>();

useEffect(() => {
  setPageActions(<CommonButton size="xs" onClick={handleAdd}>Add</CommonButton>);
  return () => setPageActions(undefined);
}, [handleAdd, setPageActions]);
```
Always clear `setPageActions` on unmount so the next page does not keep the button.

---

## 16. OPTIONAL module/components

Create `modules/{feature}/components/` only when:
- The piece is reused by two or more pages in that feature
- AND it is not a list / add / modal (those stay under `{feature}/pages/partials`)
- AND app common controls cannot do the job

`src/modules/components/` is only for shell chrome shared across features (e.g. `AdminShell`).

Belongs in `components/`: shared tab panels, detail-tab wrappers reused across pages.
Belongs in `{feature}/pages/partials/` (not components/): `Add{Feature}.tsx`, `{Feature}Modal.tsx`, `{Feature}FormPage.tsx`, `{Feature}Table.tsx`, feature filter bars.

Do not create a components folder "just in case".

---

## 17. HOOKS AND CONTEXT (optional)

- `{feature}/hooks/use{Feature}Permissions.ts` — shared permission flags used by more than one page.
- `{feature}/context/{Feature}Context.tsx` — shared parent-entity id across a tabbed details screen.

Keep page-local state in the page. Do not add context for a single list.

---

## 18. TOAST, CONFIRM, ERROR HANDLING

Use `showToast` from `@app/components/common/CustomToastMessage` on the **page / partial**, never in the service.

| Event | Do this |
|---|---|
| Load failure | `showToast.error("Failed to load {feature}.")` |
| Add success | `showToast.success("{Feature} added successfully.")` |
| Edit / update success | `showToast.success("{Feature} updated successfully.")` |
| Delete | confirm first, then service, then `showToast.success("{Feature} deleted successfully.")` |
| Activate | `showToast.success("{Name} activated.")` |
| Deactivate / inactive | `showToast.success("{Name} deactivated.")` |
| Required fields on Save | `handleSubmit(onValid, onInvalid)` → `showToast.error` with each `"{Label} is required."` on its own line (red ERROR toast). Do not submit. |
| Unexpected | `console.error` in catch, then `showToast.error` |

Do not swallow errors with an empty catch.
Do not use `window.alert` or `window.confirm`.
Do not skip the toaster because an inline field error is already showing.

---

## 19. MULTIPLE FRONTEND APPS

When the workspace has several frontend apps, the same folders and rules apply to every app. Nest under `modules/{feature}/` — still needs:
```
index.ts
pages/          list / detail outside partials
pages/partials/ add, edit, modal
types/
utils/
validator/
services/
routes/
```
Common controls live in that app's `src/app/components` (or the shared path already used). Do not copy form controls into the feature folder.

---

## 20. WHAT EACH FILE MUST NOT DO

**Page**
- Do not: axios / axiosInstance
- Do not: skip `#region`
- Do not: define types or validation rules in the page
- Do not: put add/edit JSX in the list file when it is a full form
- Do not: use raw HTML form controls
- Do not: put the edit id on the query string — use `location.state`
- Do not: use a three-level add/edit path (`/admin/users/add`) — use `/admin/add-users` and `/admin/edit-users` (rule 0.10)
- Do not: skip a toast on save, edit, delete, activate, or deactivate
- Do not: leave unused imports, unused variables, or unused helpers (rule 0.11)

**Partials (add / edit / modal)**
- Do not: live outside `partials/`
- Do not: fetch with axios directly
- Do not: skip `#region`
- Do not: omit `placeholder` on a form control
- Do not: omit `autoFocus` on the first control
- Do not: use positive `tabIndex` values
- Do not: submit a required form without `handleSubmit(onValid, onInvalid)` and an ERROR toast listing missing fields
- Do not: leave unused imports (rule 0.11)

**Service**
- Do not: showToast
- Do not: useState / JSX
- Do not: validation
- Do not: leave unused imports

**Validator**
- Do not: call the API
- Do not: use JSX
- Do not: leave unused imports

**Utils**
- Do not: call the API
- Do not: replace a page or a common control
- Do not: keep helpers that nothing calls

**index.ts**
- Do not: re-export page components (breaks lazy loading)
- Do: export `{feature}Routes` plus types / services / utils / validator

---

## 21. QUICK COPY TREE FOR A NEW FEATURE

```
src/modules/{feature}/
  index.ts
  pages/
    {Feature}ListPage.tsx                   LIST + #region
    {Feature}DetailPage.tsx                 DETAIL + #region (if the feature has one)
    partials/
      Add{Feature}.tsx                      ADD/EDIT page + #region
      {Feature}FormModal.tsx                only if the add UI is a dialog
  types/{feature}Types.ts
  utils/{feature}Helpers.ts
  validator/{Feature}Validator.ts
  services/{feature}Service.ts
  routes/index.tsx
```

Then export `{feature}Routes` from `index.ts`, register it in the host router, use only `@app/components` controls, and keep try/catch + toast on the page, not in the service beyond rethrowing the message.
