# Email System — Settings & Templates

This document covers the two related admin screens that control every email the platform sends:

- **Email Settings** (`/admin/administration-email-settings`) — the *how*: which mail server to send through, what logo/branding to show, and whether sending is turned on at all.
- **Email Templates** (`/admin/administration-email-templates`) — the *what*: the subject/body wording for each kind of message, and which icon represents it in the admin UI.

Both are read by **CFR.Acutis**, **CFR.Portal**, and any other microservice that sends mail — there is one configuration, shared by the whole platform, not one per app.

Written for two audiences at once:
- **If you're not a developer** (an admin, product owner, or QA): read "What these screens do" and "Common tasks." You don't need the rest.
- **If you're a developer** changing or extending this feature: read the whole document, especially "How to extend this" and the source-location tables.

---

## What these screens do (plain language)

### Email Settings

One shared configuration for outgoing email, used everywhere on the platform:

| Field | What it's for |
|---|---|
| Send Mail Enabled | Master on/off switch. When off, nothing goes out — not even password resets. |
| SMTP Server / Port / Username / Password | The mail account the platform sends through (today: a Gmail account). |
| Display Name | The "From" name recipients see (e.g. "Catholic Solutions"). |
| CC Address | Optional — copied on every outgoing email. |
| Contact Us Address | Shown in each email's footer as the reply/support contact. |
| SSL/TLS Enabled | Whether the connection to the mail server is encrypted (leave on unless your provider says otherwise). |
| Test Connection | Checks the server/port/credentials actually work, without sending a real email. |
| Email Logo | The image shown at the top of every outgoing email and in the Email Templates preview. |

Since this is one shared account for the whole platform, changing it here changes what every app sends — there's no separate "CFR" vs "CFR Admin" mail setup.

### Email Templates

Each row is one *kind* of message the system sends automatically (a password reset, a welcome email, a decision on an access request, etc.). For each one, an admin can edit:

- **Subject** and **Body** (rich text — bold, links, images, etc.)
- **Icon** — which symbol represents this template in the list on the left
- **Link expiry (minutes)** — only shown for the Password Reset template, since it's the only one with a time-limited link

The editor also shows the current **platform email logo read-only** (with a "Change logo" shortcut straight to Email Settings) so it's obvious which image will actually appear at the top of the email being edited, without having to switch screens to check.

Every template supports a fixed set of **merge tags** — placeholders like `[FirstName]` or `[AppName]` that get replaced with the real value when the email is actually sent. The "Insert Variable" buttons in the editor show exactly which tags are valid for the template currently open; using a tag that isn't in that list will not be replaced and will show up literally in the sent email.

### Common tasks (no code required)

- **Change what a password reset / welcome / decision email says**: open Email Templates, pick the template, edit Subject/Body, Save.
- **Change the sender name, mail account, or turn email off entirely**: Email Settings → edit the relevant field → Save. Use Test Connection first if you changed the server/port/username/password.
- **Change the logo shown in emails**: Email Settings → Email Logo → upload a JPG/PNG (up to 2 MB).
- **Give a template a different icon**: Email Templates → pick the template → "Icon" dropdown → Save.
- **Add a new merge tag to a template's wording**: only use one of the tags listed under "Insert Variable" for that specific template — see the table in "Template reference" below for the full list per template.

---

## How it works, end to end

```
Admin edits Email Settings / Email Templates (CFR Admin UI)
        |
        v
EmailSettingsController / EmailTemplatesController  (CFR.Acutis)
        |
        v
EmailSettingsService / EmailTemplatesService
        |                                   |
        v                                   v
IConfSettingsService                  Acutis_EmailTemplates SP
(reads/writes a JSON file)            (adm.EmailTemplate table)
        |
        v
_configurationSettings.json  <-- ONE shared file, read by every microservice
        |
        v
SMTPMailService.SendMailAsync()  <-- actually sends, using SMTP + logo + template content
```

Two different storage mechanisms are used, deliberately:

- **Email Settings** → a **file** (`_configurationSettings.json`), not a database row. It's small, rarely-changing, environment-specific configuration — a file is simpler to reason about and doesn't need a migration every time a field is added.
- **Email Templates** → the **database** (`adm.EmailTemplate` table). There are multiple rows (one per template code), they're queried by code/id, and they need the same Controller → Service → Repository → Stored Procedure pattern every other data-backed feature in this app uses.

---

## Email Settings — implementation detail

### Storage: one shared JSON file

`ConfSettingsService` (`backend/Service/CFR.CommonService/MailService/ConfSettingsService.cs`) is the only place that reads or writes this file. Every consumer goes through it — nothing else touches the file directly.

**Where the file lives** — resolved in this order:
1. `EmailSettings__SharedSettingsPath` environment variable (if set)
2. `EmailSettings:SharedSettingsPath` in `appsettings.{Environment}.json`
3. `EmailSettings:SharedSettingsPath` in `appsettings.json`
4. If none of those are set: falls back to that microservice's own `_configurationSettings.json` (the original, pre-shared-file behavior — nothing breaks if this setting is absent)

In **Development**, both `CFR.Acutis` and `CFR.Portal` are already configured to point at:
```
backend/Microservices/_shared/_configurationSettings.json
```
This file is **git-ignored** (it holds the SMTP password) but already exists locally, seeded from what was previously CFR.Acutis's own file.

In **Pilot/Staging/Live**, this shared path is **not yet configured** — each service still uses its own file in those environments. To finish rolling this out to a real server:
1. Pick a folder both services' app pool identities can reach (same server: any shared folder; separate servers: a network share).
2. Give the CFR.Acutis app pool **read + write** access, and every other service (CFR.Portal, etc.) **read only**.
3. Add to each service's `web.config` (inside `<aspNetCore>`):
   ```xml
   <environmentVariables>
     <environmentVariable name="EmailSettings__SharedSettingsPath" value="C:\path\to\shared\_configurationSettings.json" />
   </environmentVariables>
   ```
4. Recycle the app pools.

Saving is done via a write-to-temp-file-then-rename swap (`SaveData` in `ConfSettingsService.cs`), so a service reading the shared file mid-save never sees a half-written file. Reading retries briefly on an `IOException` for the same reason.

### The logo in real emails: embedded inline, not linked (as of the latest update)

Real outgoing emails (password reset, welcome, decisions, "Send Test", etc.) now **embed the logo's actual file bytes inside the email itself**, as an inline `cid:` image (`SendMailAsync` in `SMTPMailService.cs`, using `System.Net.Mail`'s `LinkedResource`/`AlternateView`) — the same technique most real-world transactional email systems use, and the correct fix for the problem this doc used to describe as a "known trade-off."

**Why this matters**: previously the logo was only ever a `<img src="https://...">` **link**, which only renders if the recipient's mail client can reach that URL over the public internet — never true for a `localhost`/dev API. Embedding sidesteps that entirely: the image data travels inside the email, so it renders correctly for every recipient regardless of environment, and regardless of whether the sending server is reachable from the outside at all.

**How the file is located** — `ConfSettingsService.ResolveEmailLogoFilePath`, first match wins:
1. `EmailSettings:LogoDirectory` (appsettings.{Environment}.json, then appsettings.json) — for a microservice that doesn't own the upload folder (e.g. `CFR.Portal`, which needs to be told where `CFR.Acutis` actually saved the file).
2. `ApplicationFilePath:Doc_BasePath` (or `AppStrings:GatewayRoot`) + `Acutis\Attachment\EmailSettings` — where `CFR.Acutis` (`FileHandlerService`) saves the upload; this is why `CFR.Acutis` itself needs no extra config.
3. `{content root}\wwwroot\Acutis\Attachment\EmailSettings`, then the sibling `CFR.Acutis` project's copy — local-dev fallbacks when neither setting above is present.

**When embedding isn't possible** (the file can't be found on disk with any of the above, or a *per-template* logo URL override is passed in instead of the platform-wide one), the code falls back to the **old URL-linking behavior** — and the loopback safety rule from before still applies there: `GetLogoMarkup`'s `IsLoopbackHost` check silently removes a `localhost` **link** from a real email (there's no point linking to something a recipient can never reach), while the **admin Preview** modal (browser-rendered, not an emailed image) is exempt from that check since it's just for your own screen. That rule was deliberately reviewed and kept as-is for this fallback path; see git history on `SMTPMailService.cs`/`ConfSettingsService.cs` if you're tempted to change it.

**If a logo is configured but couldn't be embedded**, a warning is logged (`SerilogErrorMessages.MailLogMessages.EmailLogoNotEmbedded`) naming the exact configured logo file — check the logs first if a "Send Test" isn't showing the logo you expect; it'll tell you whether the cause is `LogoDirectory`/`Doc_BasePath` pointing at the wrong place for that microservice.

**Practical result**: the `ngrok`-tunnel workaround this doc used to recommend for seeing a real logo in a local test email is **no longer necessary** for the normal case (the platform-wide logo uploaded via Email Settings) — as long as `LogoDirectory`/`Doc_BasePath` correctly points at the real upload folder for whichever microservice is sending, the logo embeds and shows up regardless of environment. The tunnel is still relevant only for the fallback URL-linking path (a per-template logo override, or a misconfigured/missing `LogoDirectory`).

### Test Connection: how it actually tests

`SMTPMailService.TestConnectionAsync` does **not** use .NET's `SmtpClient` — it's a hand-written raw-socket SMTP client (`EHLO` → `STARTTLS` → TLS upgrade → `EHLO` again → `AUTH LOGIN`) so the test exercises the exact same protocol steps a real send would use, including whatever SSL/TLS quirks the target server has. If a password field is left blank on this screen, the test (and Save) fall back to the currently-stored password rather than testing/sending with an empty one.

### Frontend

| Piece | Path |
|---|---|
| Page | `frontend/CFR_Admin/src/modules/administration/emailSettings/pages/EmailSettingsPage.tsx` |
| Types | `.../emailSettings/types/emailSettingsTypes.ts` |
| API calls | `.../emailSettings/services/emailSettingsService.ts` |
| Field validation | `.../emailSettings/validator/EmailSettingsValidator.ts` |
| Form ⇄ API mapping | `.../emailSettings/utils/emailSettingsHelpers.ts` |

Note: the **API Base URL** and **product-request notification recipient** fields are edited on a separate page (`modules/administration/cfrSettings/pages/CfrSettingsPage.tsx`, "CFR Settings"), not on this Email Settings page — they share the same backend config but are exposed on different screens for access-control reasons.

### Backend source locations

| Piece | Path |
|---|---|
| Controller | `backend/Microservices/CFR.Acutis/Controllers/Administration/EmailSettingsController.cs` |
| Service | `backend/Service/CFR.AcutisService/Service/Administration/EmailSettingsService.cs` |
| Shared config reader/writer | `backend/Service/CFR.CommonService/MailService/ConfSettingsService.cs` |
| SMTP send / test / logo URL logic | `backend/Service/CFR.CommonService/Services/SMTPMailService.cs` |

### API endpoints (all under `EmailSettings` controller)

| Action | Purpose |
|---|---|
| `GetEmailSettings` | Load current settings for the page. |
| `SaveEmailSettings` | Save SMTP/branding fields (not the logo file, not ApiBaseUrl). |
| `TestConnection` | Raw SMTP handshake test using the in-progress form values. |
| `UploadEmailLogo` / `RemoveEmailLogo` | Manage the logo image file. |
| `GetEmailLogo` | Anonymous, public — streams the logo image back (this is what the `<img src>` in emails actually points to). |
| `SaveApiBaseUrl` | Sets this API's own public base URL (CFR Settings page). |
| `SaveProductRequestNotifyUser` | Sets which Acutis user gets notified of new product suggestions (CFR Settings page). |

---

## Email Templates — implementation detail

### Template reference (current templates, what triggers each, and its merge tags)

| Template code | Sent when… | Merge tags |
|---|---|---|
| `PasswordReset` | A user requests a password reset | `[FirstName]`, `[ResetLink]`, `[ExpiryMinutes]` |
| `Welcome` | A new account is provisioned | `[FirstName]` |
| `AccessApproved` | An admin approves an access request | `[FirstName]`, `[AppName]` |
| `AccessSentToVendor` | An admin clicks "Send to Vendor" on an access request — sent to the product's contact user | `[ContactName]`, `[AppName]`, `[OrganizationName]`, `[OrganizationAddress]`, `[RequesterName]`, `[RequesterEmail]`, `[Phone]`, `[SubmittedDate]`, `[Note]` |
| `AccessInfo` | A reviewer asks for more detail on a request | `[FirstName]`, `[AppName]`, `[Note]` |
| `AccessRequested` | A member submits an access request — sent to the product's support user (requester on CC) | `[SupportUserName]`, `[AppName]`, `[OrganizationName]`, `[OrganizationType]`, `[OrganizationAddress]`, `[RequesterName]`, `[RequesterEmail]`, `[Phone]`, `[SubmittedDate]`, `[AdditionalInfo]`, `[ReviewLink]` |
| `ProductRequested` | A visitor suggests a new product (sent to admins) | `[ProductName]`, `[ShortName]`, `[ProductionUrl]`, `[Description]`, `[Features]`, `[RequesterName]`, `[RequesterEmail]`, `[ReviewLink]` |
| `ProductRequestApproved` | A product suggestion is approved | `[FirstName]`, `[RequesterName]`, `[ProductName]`, `[ClientId]`, `[SecurityKey]`, `[Remarks]` |
| `ProductRequestRejected` | A product suggestion is rejected | `[FirstName]`, `[RequesterName]`, `[ProductName]`, `[Remarks]` |

> `AccessRequested`'s recipient changed from "admins generally" to the product's specific support user (with the requester CC'd), and its subject changed from `New access request for [AppName]` to `Review needed: [AppName] access request from [OrganizationName]` — so it reads distinctly from `AccessSentToVendor`'s subject. If you're looking at an environment seeded before this change, `019_Acutis_EmailTemplatesContentFix.sql` is the migration that backfills already-existing rows to this content (only pristine, never-admin-edited rows are touched).

Every template also implicitly supports `[AccentColor]` (the platform brand color) — it's used inside some templates' HTML styling and is not meant to be inserted mid-sentence, so it's deliberately not offered as an "Insert Variable" button.

If a template's Subject/Body contains a `[Tag]` that isn't in its own list above, the admin editor flags it as an "unsupported placeholder" — it will be sent to recipients literally (unreplaced), not silently dropped.

### Storage: the `adm.EmailTemplate` table

One row per template code. Relevant columns: `TemplateId`, `TemplateCode`, `Subject`, `Body`, `IsActive`, `LinkExpiryMinutes` (only meaningful for `PasswordReset`), `IconName` (a [lucide-react](https://lucide.dev/icons/) icon name, e.g. `"KeyRound"`), plus audit columns. A few older columns (`AccentColor`, `LogoUrl`, `FontFamily`, `BaseFontSize`) still exist on the table but are **dead** — branding moved to the platform-wide Email Settings page, so nothing reads or writes them anymore; they were left in place rather than risking a destructive column drop.

All CRUD goes through one stored procedure, `[dbo].[Acutis_EmailTemplates]`, discriminated by `@ActionId`:

| ActionId | Action |
|---|---|
| 1 | Save (insert if `@TemplateId = 0`, otherwise update) |
| 2 | Get by `TemplateId` |
| 3 | Get list (all templates — what the admin page loads) |
| 4 | Get by `TemplateCode` (used internally at send time, e.g. by `AcutisPasswordService` to load `PasswordReset`) |

Migration script: `backend/Infrastructure/CFR.AcutisInfrastructure/Scripts/006_Acutis_EmailTemplates.sql`. It both defines the stored procedure and seeds every template code above — **idempotent**, safe to re-run; each `IF NOT EXISTS` block only inserts a row if that template code doesn't already exist, and a few `UPDATE ... WHERE` guards upgrade specific older seeded content without touching anything an admin has since customized.

A separate, later script — `019_Acutis_EmailTemplatesContentFix.sql` — exists specifically for **content fixes to already-seeded environments**, since `006`'s own `IF NOT EXISTS` seed guard only ever fires once per template code and can't be relied on to push out a wording/subject change to a database that already has that row. Same non-destructive pattern: every `UPDATE` is guarded on the row still holding an exact previous body/subject, so any row an admin has since edited through the UI is left alone. When you need to change a template's *seed* content going forward, follow this same two-part pattern: update the `006` seed INSERT (for brand-new environments) **and** add a guarded `UPDATE` in a new script like `019` (for environments that already have the old row) — one alone is not enough for that change to actually reach every environment.

> **Known cleanup item**: `006_Acutis_EmailTemplates.sql` currently has two separate `IF NOT EXISTS (... WHERE [TemplateCode] = N'AccessSentToVendor')` seed blocks (a leftover from two branches independently adding the same template during a merge). The first one always wins on a fresh database, so this isn't currently causing wrong behavior — but the second block's `INSERT` is also missing the `IconName` column, so if the first block were ever removed without also removing the second, a fresh seed would silently lose that template's icon. Worth deduplicating next time this file is touched.

### The icon system

Icons are **data-driven**, not guessed from the template code. `EmailTemplateOutput`/`EmailTemplateInput` (backend) and `EmailTemplateApiItem` (frontend) all carry an `iconName` string field, which round-trips through the Save flow exactly like Subject/Body.

The frontend resolves that string into an actual icon component via a small, closed registry in `EmailTemplatesPage.tsx`:

```ts
const ICON_REGISTRY: Record<string, typeof Mail> = {
  Mail, KeyRound, Sparkles, MailCheck, MailQuestion, Send, Wand2, CheckCircle2, AlertTriangle,
};
```

The "Icon" dropdown in the editor offers exactly these 9 names. An `iconName` that's blank or doesn't match any key here (e.g. if the database is ever edited directly with an unlisted name) falls back to the generic `Mail` icon — it never errors.

*(Implementation note for developers: the actual rendering is a `switch` statement over these names — `TemplateIconGlyph` — rather than picking a component reference out of the registry object and rendering that. Resolving a component reference into a variable at render time and then rendering it is flagged by this project's React Compiler lint rule (`react-hooks/static-components`), since it creates a "new" component identity every render and can reset state. If you add a new icon option, add both a new `import` from `lucide-react`, a new entry in `ICON_REGISTRY` (for the dropdown list), and a new `case` in `TemplateIconGlyph`.)*

### Frontend source locations

| Piece | Path |
|---|---|
| Page (list + editor + preview, one component) | `frontend/CFR_Admin/src/modules/administration/emailTemplates/pages/EmailTemplatesPage.tsx` |
| Types | `.../emailTemplates/types/emailTemplatesTypes.ts` |
| API calls | `.../emailTemplates/services/emailTemplatesService.ts` |
| Merge-tag list, display labels/descriptions per template code | `.../emailTemplates/utils/emailTemplatesHelpers.ts` |
| Body/subject length & format validation | `.../emailTemplates/validator/EmailTemplatesValidator.ts` |

### Backend source locations

| Piece | Path |
|---|---|
| Controller | `backend/Microservices/CFR.Acutis/Controllers/Administration/EmailTemplatesController.cs` |
| Service | `backend/Service/CFR.AcutisService/Service/Administration/EmailTemplatesService.cs` |
| Repository | `backend/Infrastructure/CFR.AcutisInfrastructure/Repositorys/Administration/EmailTemplatesRepository.cs` |
| Input/Output DTOs | `backend/Infrastructure/CFR.AcutisInfrastructure/Models/Input/EmailTemplateInput.cs`, `.../Models/Output/EmailTemplateOutput.cs` |
| SQL (table alterations, stored procedure, seed data) | `backend/Infrastructure/CFR.AcutisInfrastructure/Scripts/006_Acutis_EmailTemplates.sql` |
| SQL (content-only fixes to already-seeded environments) | `backend/Infrastructure/CFR.AcutisInfrastructure/Scripts/019_Acutis_EmailTemplatesContentFix.sql` |

### API endpoints (all under `EmailTemplates` controller)

| Action | Purpose |
|---|---|
| `GetEmailTemplates` | List (used by the admin page). |
| `GetEmailTemplateById` | Fetch one, by id. |
| `SaveEmailTemplate` | Insert or update Subject/Body/Status/LinkExpiryMinutes/IconName. |
| `SendTestEmail` | Emails the currently-open **draft** content as-is (no merge-tag substitution — it's a raw preview send, not a simulation of the real trigger). |

A note worth knowing when debugging "why didn't this text change show up": there's a second, structurally identical Email Templates implementation under `CFR.PortalInfrastructure`/`CFR.PortalService` for the separate `CFR.Portal` microservice. The two don't share code (see `frontend/CLAUDE.md` / backend `CLAUDE.md` project-boundary rules) — a change made in one does not apply to the other.

---

## How to extend this

### Add a brand-new template code (e.g. a new automated email)

1. Add a seed block to `006_Acutis_EmailTemplates.sql` (copy an existing `IF NOT EXISTS (...) BEGIN ... END` block, following the exact pattern already there) with the new `TemplateCode`, `Subject`, `Body`, and an `IconName` from the existing registry (or add a new one — see below). If you're changing an *existing* template's seed content rather than adding a brand-new one, also add a guarded `UPDATE` to a new content-fix script (see `019_Acutis_EmailTemplatesContentFix.sql` for the pattern) — the `IF NOT EXISTS` seed alone won't reach a database that already has that row.
2. Add the same code's merge-tag list to `EMAIL_TEMPLATE_VARIABLES` in `emailTemplatesHelpers.ts`, plus a case in `templateDisplayLabel` and `templateDescription`.
3. Wherever the email is actually triggered (a `*Service.cs` method that calls `SendTemplatedEmailAsync`/similar), make sure it looks up the template by the same `TemplateCode` string and passes the same placeholder names your merge-tag list promises — a mismatch here means the admin editor accepts an "Insert Variable" tag the actual send path never fills in.
4. Run the migration script against the target database.

### Add a new icon option

1. Import the new icon from `lucide-react` at the top of `EmailTemplatesPage.tsx`.
2. Add it to `ICON_REGISTRY`.
3. Add a matching `case` to `TemplateIconGlyph`.
4. (Optional) seed it as the default for a template in the SQL script.

### Add a new Email Settings field

1. Add the property to `SMTPMailConfig` in `ConfSettingsService.cs` (this is what actually gets serialized to the shared JSON file — no migration needed, it's just a new JSON key).
2. Add it to `EmailSettingsInput`/`EmailSettingsOutput` (backend DTOs) and wire it through `EmailSettingsService.SaveEmailSettingsAsync`/`GetEmailSettingsAsync`.
3. Add it to the frontend's `EmailSettingsFormValues`/`EmailSettingsApiItem` types, `emailSettingsHelpers.ts` mapping, and the page's form.

### Change the SMTP provider

Just update the fields on the Email Settings page (server/port/username/password/SSL) and click **Test Connection** before saving — no code change needed for a standard SMTP provider. If the new provider needs a fundamentally different auth flow (e.g. OAuth2 instead of `AUTH LOGIN`), that requires code changes to `SMTPMailService`'s raw-socket implementation.

---

## Onboarding a new/upcoming microservice

A new microservice (e.g. a future `CFR.DataSync`-style service) needs different amounts of setup depending on what it needs to do:

### To just *read* the shared settings (e.g. check if mail is enabled, read the logo URL)

If it already calls the shared `builder.Services.AddCommonServicesSetup()` in its `Program.cs` — every microservice does, this is boilerplate every one of them already has — it **already has `IConfSettingsService` registered**, for free, with no extra step. That single call (in `CFR.Base/CommonServiceExtension.cs`) registers it once, platform-wide:
```csharp
services.AddScoped<IConfSettingsService, ConfSettingsService>();
```
Inject `IConfSettingsService` into any of your service's constructors and call `.LoadData()`.

**Concrete example**: `CFR.DataSync` is in exactly this state today — it calls `AddCommonServicesSetup()` and its `CFR.DataSyncService` project already references `CFR.CommonService`, so `IConfSettingsService` is available to inject right now, with zero additional wiring.

### To also *send* mail from that service

Two more steps:

1. **Register the sender** in that microservice's own `ServiceExtension.cs` (copy this line from `CFR.Acutis`/`CFR.Portal`'s `ServiceExtension.cs`):
   ```csharp
   services.AddScoped<ISMTPMailService, SMTPMailService>();
   ```
2. **Add an `EmailSettings` section** to that microservice's own `appsettings.{Environment}.json` files (see the environment config table below), with **`LogoDirectory` in particular** — without it, this new service can't find the uploaded logo file on disk to embed it, and every email it sends will silently fall back to the loopback-affected URL-linking path instead (see "The logo in real emails" above). `CFR.DataSync` currently has **no** `EmailSettings` key in any of its appsettings files, so it isn't wired for this yet.

Nothing else needs to change — `IConfSettingsService`/`ISMTPMailService` are shared, generic services with no per-microservice logic inside them.

## Environment configuration reference

Everything below lives under an `"EmailSettings": { ... }` object in `appsettings.{Environment}.json` (or the base `appsettings.json`, or an `EmailSettings__KeyName` environment variable, which always wins over both files).

| Key | Purpose | Required? |
|---|---|---|
| `ApiBaseUrl` | Overrides the persisted logo-URL host for *this* environment — only used by the fallback URL-linking path (see "The logo in real emails" above). Only needed when the persisted value in the shared settings file might be wrong for this specific environment/server (e.g. it's a `localhost` value left over from Development). | Optional — falls back to the persisted `ApiBaseUrl` in the settings file, then to `LoginURL`. |
| `SharedSettingsPath` | Points this microservice at the one shared `_configurationSettings.json` instead of its own private copy. Relative paths resolve against the microservice's own folder; `%ENV_VARS%` are expanded. | Optional — omitting it keeps this service on its own private settings file (fully backward compatible). |
| `LogoDirectory` | The folder where the uploaded email logo file actually lives on disk, so this microservice can read the file's bytes and **embed** it inline in outgoing email — only needed by a service that doesn't itself own the upload folder (i.e. isn't `CFR.Acutis`). Absolute path; `%ENV_VARS%` are expanded. | Optional for `CFR.Acutis` (resolves via `ApplicationFilePath:Doc_BasePath` already). **Effectively required for every other service** (e.g. `CFR.Portal`) once it sends real email, or its logo silently falls back to the loopback-affected URL-linking path. |

**Per-environment cheat sheet** (what's actually set today):

| Environment | `ApiBaseUrl` | `SharedSettingsPath` | `LogoDirectory` |
|---|---|---|---|
| Development (`CFR.Acutis`) | `https://localhost:5050/acutis` | `../_shared/_configurationSettings.json` | *not set — resolves via `Doc_BasePath`* |
| Development (`CFR.Portal`) | `https://localhost:5050/acutis` | `../_shared/_configurationSettings.json` | `...\CFR.Acutis\wwwroot\Acutis\Attachment\EmailSettings` (points at the sibling `CFR.Acutis` project folder on the same dev machine) |
| Pilot (`CFR.Acutis`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | `C:\inetpub\catholicsolution\cfrapi.allnewoptionc.com\wwwroot\Acutis\Attachment\EmailSettings` |
| Pilot (`CFR.Portal`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | `C:\inetpub\catholicsolution\cfrapi.allnewoptionc.com\wwwroot\Acutis\Attachment\EmailSettings` (same physical folder as `CFR.Acutis` — same server) |
| Staging (`CFR.Acutis`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | same pattern as Pilot |
| Staging (`CFR.Portal`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | same pattern as Pilot |
| Live (`CFR.Acutis`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | same pattern as Pilot |
| Live (`CFR.Portal`) | `https://cfrapi.allnewoptionc.com/acutis` | *not set — own file* | same pattern as Pilot |

Note that `CFR.Acutis` itself never needs `LogoDirectory` set explicitly — it already resolves the folder via `ApplicationFilePath:Doc_BasePath` (the same setting used for every other file upload). `CFR.Portal` needs it everywhere, because it has no `Doc_BasePath` of its own that points at that folder.

To add `SharedSettingsPath` for Pilot/Staging/Live, see the numbered setup steps under "Storage: one shared JSON file" above — it needs an ops decision about where that shared file lives on the real server(s) before it can be filled in here.

**A new microservice's own appsettings, filled in for consistency with the above**, would typically look like:
```json
{
  "EmailSettings": {
    "ApiBaseUrl": "https://cfrapi.allnewoptionc.com/acutis",
    "SharedSettingsPath": "../_shared/_configurationSettings.json",
    "LogoDirectory": "C:\\inetpub\\catholicsolution\\cfrapi.allnewoptionc.com\\wwwroot\\Acutis\\Attachment\\EmailSettings"
  }
}
```
— same shared-path and logo-directory values as every other service in that environment, so they all end up reading/writing the exact same settings file and embedding the exact same logo image.

## Known trade-offs (read before "fixing" these)

- **Loopback logo stripping cannot be turned off for convenience** — but it's now only reached via the fallback URL-linking path, not the normal case. Since inline embedding was added, a correctly-configured `LogoDirectory`/`Doc_BasePath` means most environments never hit this path at all. It's been reviewed and deliberately kept environment-agnostic (it doesn't trust "is this Development" — a misconfigured deployed server can claim to be Development too). If you still hit this (embedding failed and it fell back to a `localhost` link), fix `LogoDirectory`/`Doc_BasePath` rather than a public tunnel or a code change — check the logs for `EmailLogoNotEmbedded` first.
- **Pilot/Staging/Live don't share one settings file yet.** Only Development is wired up to the shared path today. Until an ops decision is made about where that shared file should live on a real server (see the setup steps above), those three environments still use one settings file per microservice — meaning a save on the Email Settings page in Pilot only affects `CFR.Acutis` there, not `CFR.Portal`.
- **`SendTestEmail` doesn't simulate a real trigger.** It sends the literal current draft, unsubstituted. It cannot catch a bug where the real trigger passes the wrong placeholder names — only manually triggering the real flow (e.g. actually requesting a password reset) tests that.
