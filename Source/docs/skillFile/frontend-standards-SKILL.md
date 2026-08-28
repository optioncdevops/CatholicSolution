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
| Actions | `FormActionsBar` |
| Layout | `PageShell`, `PageNote`, `PageHeader` |

Do not use raw `<input>`, `<select>`, `<button>`, or add a new table library.
(If the host app names these controls differently, use its equivalents — never raw HTML controls.)

### 0.5 Pages MUST use `//#region` blocks
See section 10. Required on list pages, add/edit pages, and modals.

### 0.6 Default export for route pages
```tsx
export default CustomerDirectory;
```
Named exports are OK for types, validators, utils, and small presentational pieces.

---

## 1. APP FOLDERS (do not recreate these inside a module)

```
src/
  app/
    components/          SHARED UI — always import from here
      formControls/      InputField, Dropdown, DatePicker, RadioGroup, ...
      buttons/           CommonButton, CommonIconButton
      dataTable/         CustomDataTable, CustomServerSideDataTable
      common/            PageHeader, PageNote, FormActionsBar, CustomToastMessage,
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
| Route path | kebab-case: `customer-directory`, `system-messages` |
| Child routes | `add` \| `new` \| `edit` \| `copy` — pick one convention per module and stay consistent |

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
    required: FIELD_REQUIRED,
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address.",
    },
  },
};
```

Page usage: `rules={customerDirectoryRules.txtEmailaddress}`

Do not copy the required message as a raw string on every field.
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
Do not hard-code the API host; `AxiosInstance` already has the base URL from environment config.

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
const UserDetailPage = lazy(() => import("../pages/UserDetailPage"));

export const usersRoutes = (
  <>
    <Route path="/admin/users" element={<UsersListPage />} />
    <Route path="/admin/users/:userId" element={<UserDetailPage />} />
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

Navigate to add:
```tsx
navigate("add")                          // relative (preferred when already on the list)
navigate("/admin/users")                 // absolute list
navigate("/faq-details/edit", { state: { id } })
```

Pass edit id through `location.state`, not a query string, unless the URL must be shareable.
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
      <CommonButton size="xs" onClick={() => navigate("add")}>
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

Use `CommonCard` + form controls + `FormActionsBar`. Same file handles add and edit when the form is identical (read id from `location.state`).

```tsx
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { CommonCard } from "@app/components/cards/CommonCard";
import { CommonButton } from "@app/components/buttons";
import { FormActionsBar } from "@app/components/common";
import { showToast } from "@app/components/common/CustomToastMessage";
import { InputField, MandatoryIndicator } from "@app/components/formControls";
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
      <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          <div className="col-span-12 md:col-span-6">
            <InputField
              control={control}
              name="txtEmailaddress"
              label="E-Mail Address"
              type="email"
              placeholder="Enter email address"
              required
              maxLength={100}
              rules={customerDirectoryRules.txtEmailaddress}
              disabled={loading}
            />
          </div>
        </div>
        <FormActionsBar>
          <CommonButton type="submit" variant="success" intent="save" loading={loading} disabled={loading}>
            Save
          </CommonButton>
          <CommonButton type="button" variant="secondary" intent="cancel" onClick={navigateToList} disabled={loading}>
            Cancel
          </CommonButton>
        </FormActionsBar>
      </form>
    </CommonCard>
  );
  //#endregion
};

export default AddCustomerDirectory;
```

Form layout:
- `grid grid-cols-1 gap-6 md:grid-cols-12`; fields use `col-span-12 md:col-span-3|4|6`
- Save / Cancel live in `FormActionsBar`, Save first, Cancel second
- `required` on the control AND `rules` from the validator
- `form noValidate` — HTML5 native bubbles are off; react-hook-form shows the errors

---

## 13. MODAL TEMPLATE (INSIDE partials)

When add/edit is a dialog on top of the list (not a separate route): list stays in `{Feature}.tsx`; modal lives in `partials/{Feature}Modal.tsx`; list imports the modal and passes `isOpen` / `onClose` / `onSaved`.

```tsx
import { useForm } from "react-hook-form";
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
  //#endregion

  //#region Render
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Email Address"
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <CommonButton variant="success" onClick={handleSubmit(onSubmit)}>Save</CommonButton>
          <CommonButton variant="secondary" onClick={onClose}>Cancel</CommonButton>
        </div>
      }
    >
      <InputField control={control} name="txtEmailaddress" label="E-Mail Address" type="email" required rules={customerDirectoryRules.txtEmailaddress} />
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

**Layout:** `PageShell` (module Index), `PageHeader` / `PageNote`, `FormActionsBar` (Save / Cancel row), `CommonCard` (add/edit forms), `ButtonNavigation` (module section tabs), `MenuTabBar` (in-page tabs), `BaseModal` (dialogs), `DetailGrid` (read-only detail view)

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

| Event | Do this |
|---|---|
| Load failure | `showToast.error("Failed to load {feature}.")` |
| Save success | `showToast.success("{Feature} added successfully.")` or `"...updated successfully."` |
| Delete | `showDeleteConfirm("record name")` then service then `showToast.success("Deleted Successfully.")` |
| Unexpected | `console.error` in catch, then `showToast.error` |

Do not swallow errors with an empty catch.
Do not use `window.alert` or `window.confirm`.

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

**Partials (add / edit / modal)**
- Do not: live outside `partials/`
- Do not: fetch with axios directly
- Do not: skip `#region`

**Service**
- Do not: showToast
- Do not: useState / JSX
- Do not: validation

**Validator**
- Do not: call the API
- Do not: use JSX

**Utils**
- Do not: call the API
- Do not: replace a page or a common control

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
