# Validation Standard — Acutis Authentication

Scope and date: session task, 2026-08-26. Defines the validation rules enforced across every
Acutis authentication endpoint and form, and documents where each rule is enforced (frontend
React Hook Form, backend DataAnnotations, backend service). **Backend validation is authoritative
— frontend validation exists only for UX and is never trusted for a security decision.** No
database, stored procedure, or authentication contract change is included in this document or the
work it describes.

## Phase 1 findings — current state before this task

- **No FluentValidation anywhere in the backend** (`grep` confirmed zero references in any
  `.csproj`/`.cs`). The established convention is `System.ComponentModel.DataAnnotations` on
  request DTOs (`[Required]`, `[EmailAddress]` — already used on `AcutisLoginRequest`,
  `AcutisForgotPasswordRequest`, `AcutisChangePasswordRequest`, `AcutisResetPasswordRequest`) plus
  explicit imperative checks inside `AcutisAuthenticationService` for anything DataAnnotations
  cannot express (equality, enumeration-safety, business rules). This task follows that existing
  convention rather than introducing a validation framework.
- **A real gap found and fixed by this task:** `CFR.Acutis` used plain `AddControllers()` with no
  `ApiBehaviorOptions` configured, so a DataAnnotations failure (e.g. missing `Password`) produced
  ASP.NET Core's default `ValidationProblemDetails` shape — **not** the `MSResultArgs` envelope
  every other response on this API uses. The frontend's `apiRequest` parses
  `{statusCode, statusMessage, resultData}` — a `ValidationProblemDetails` body doesn't match that
  shape, so a raw `[Required]` failure would have surfaced as a generic "Request failed (400)"
  instead of a proper per-field error. Fixed by `AcutisValidationSetup.AddAcutisValidationSetup`
  (new, `CFR.Acutis`-only — `CFR.Base`/`CFR.Gateway`/`CFR.Portal` untouched), which overrides
  `ApiBehaviorOptions.InvalidModelStateResponseFactory` to return the same `MSResultArgs` envelope,
  `StatusCode = 400`, with one `ErrorDetail(field, message)` per failed property.
- **Service-level validation already existed** for required fields, `NewPassword`/`ConfirmPassword`
  equality, and enumeration-safe Forgot Password — but had three gaps this task closes: no password
  **policy** (length/complexity) anywhere, no "current and new password must differ" check in
  Change Password, and no defense against a structurally-implausible reset token being handed to
  the token store.
- **Mock vs. real frontend adapters already matched behavior** for the paths that existed
  (same credential pair, same "not supported" write blockers, same generic Forgot Password
  response) — this task extends both adapters together so that stays true for every new rule.
- **No React Hook Form anywhere in this project.** `frontend/CFR_Admin` already depends on
  `react-hook-form@^7.85.0` (no schema library — `zod` appears only as another package's transitive
  dependency, not a direct dependency anywhere in this repo) — this task adds the same
  `react-hook-form` version to `frontend/SaaS_Apps/acutis` and uses its built-in `rules`/`register`
  validation, per this repo's own precedent, rather than adding a schema library.
- **`ErrorDetail(string field, string message)` already exists** on `CFR.DBEngine.MSResultArgs`
  (`Errors` property) and is already typed on the frontend (`MSResultArgs<T>.errors`), but nothing
  populated or consumed it before this task — both ends are wired for the first time here.

## General rules (apply to every form/endpoint below)

- **Trim only where appropriate.** Email/username fields are trimmed server-side before use
  (`AcutisAuthenticationService`) and on blur client-side. **Passwords, new passwords, confirm
  passwords, and reset tokens are never trimmed, transformed, or otherwise silently modified** —
  a password's leading/trailing whitespace is part of the value the user typed and changing it
  would be a silent, unexpected behavior change.
- **All time-based validation uses UTC.** Reset-token expiry (`InMemoryPasswordResetTokenStore`)
  already compares `DateTimeOffset.UtcNow` — unchanged, confirmed correct, documented here for
  completeness.
- **Consistent error codes and field names.** Every validation failure — whether raised by
  DataAnnotations (via `AcutisValidationSetup`) or by the service — returns the same `MSResultArgs`
  envelope shape: `StatusCode = 400` (`ErrorCodes.BadRequest`) for structural/business-rule
  failures the caller can fix, `StatusCode = 203` (`ErrorCodes.Failed`, mapped to HTTP 400) for
  authoritative domain failures (wrong credentials, invalid reset token) that must not reveal
  *why*. Field names in `Errors[].field` are camelCase, matching the frontend's TypeScript field
  names exactly (`newPassword`, not `NewPassword`).
- **Never return internal exception messages.** Every `catch` block in
  `AcutisAuthenticationService` already returns `ErrorMessages.InternalServerError`, a fixed
  string — confirmed unchanged, verified by an existing test
  (`LoginAsync_RepositoryThrows_HandledSafelyAsInternalServerError`) that asserts the real
  exception text never appears in the response.
- **Never reveal whether an account exists.** Forgot Password's response is identical regardless
  of `AccountFound` (already true, re-verified this task) — extended to Reset Password's token
  validation, which already collapses `NotFound`/`Expired`/`AlreadyUsed` into one generic message
  (unchanged), and now also to a structurally-implausible token (see below), which is folded into
  the *same* generic response rather than a distinguishable "malformed token" error.

## 1. Login

| Rule | Enforced at |
|---|---|
| Username/email required | Frontend (RHF `required`), DTO (`[Required]`), service (`IsNullOrWhiteSpace` check, unchanged) |
| Email format | Frontend (RHF pattern rule), DTO (`[EmailAddress]`, **added this task** — the Acutis login identifier has been documented as an email address since Task 2/9's specs and the one DEV FAKE credential; this assumes that contract, not a new decision) |
| Password required | Frontend (RHF `required`), DTO (`[Required]`), service (unchanged) |
| Password whitespace handling | Password is sent exactly as typed — **never trimmed**, on either end. A password consisting only of whitespace still fails the `[Required]`/`IsNullOrWhiteSpace` check (that check already treats whitespace-only as absent), but any password that *contains* whitespace as part of it is preserved byte-for-byte. |
| Generic invalid-credential response | Unchanged — `ErrorCodes.Failed`, `"Invalid username or password."`, identical for "no such user" and "wrong password" (the repository itself only reports `Succeeded`/`FailureReason`, never which). |
| No account enumeration | Same generic message regardless of failure reason (unchanged) — confirmed by existing test `LoginAsync_InvalidCredentials_ReturnsGenericError`. |

## 2. Forgot password

| Rule | Enforced at |
|---|---|
| Email required | Frontend, DTO (`[Required]`, unchanged), service (unchanged) |
| Email format | Frontend, DTO (`[EmailAddress]`, unchanged) |
| Generic response for valid and invalid email | Unchanged, re-verified — `ForgotPasswordAsync_AccountFoundOrNotFound_ReturnsIdenticalGenericResponse` |
| Email trimmed before lookup | **Added this task** — `request.Email.Trim()` passed to `FindAccountByEmailAsync`/the email sender, so `"user@x.test "` and `"user@x.test"` resolve identically instead of a trailing space silently causing a "not found" lookup that still (correctly) returns the same generic response, but for the wrong reason. |

## 3. Reset password

| Rule | Enforced at |
|---|---|
| Token required | Frontend, DTO (`[Required]`, unchanged), service (unchanged) |
| Token format and length | **Added this task**, service-level only (not DTO — see rationale below): `AcutisAuthValidation.IsPlausibleResetToken` rejects a token that, after trimming, is under 16 characters or contains internal whitespace, **before** calling the token store. A failure here returns the exact same `ErrorCodes.Failed`/`"This reset link is invalid or has expired."` response as a token the store itself rejects — deliberately *not* a distinguishable `BadRequest`, so a structurally-malformed token never reveals anything an attacker could use to distinguish "wrong shape" from "right shape, not found." The real token generator (`InMemoryPasswordResetTokenStore`) produces 43-character URL-safe base64 tokens; 16 is a generous lower bound that rejects only obvious garbage, not a claim about the real production token shape (which is unverified — see database-contract.md). |
| New password required | Frontend, DTO (`[Required]`, unchanged) |
| Confirm password required | Frontend, DTO (`[Required]`, unchanged) |
| Password equality | Frontend (RHF cross-field `validate`), service (unchanged — `string.Equals(..., StringComparison.Ordinal)`, exact match, no case-folding) |
| Password policy | **Added this task** — `AcutisAuthValidation.PasswordPolicyDescription` / `IsPasswordPolicyCompliant`: minimum 8 characters, at least one letter and one digit. This is an **industry-baseline default**, not a value confirmed against any real database-side policy (none exists to confirm — see database-contract.md's password-write blocker) — documented here explicitly so it is never mistaken for a verified production rule. Applied identically to Reset and Change Password's `NewPassword`. |
| Expired, invalid, and reused token behavior | Unchanged, already correct — `PasswordResetTokenFailureReason.{NotFound,Expired,AlreadyUsed}` all collapse to the same generic message and are never distinguished to the caller (existing test: `ResetPasswordAsync_InvalidToken_HandledSafelyWithGenericFailure`, parametrized this task over all three reasons). |

## 4. Change password

| Rule | Enforced at |
|---|---|
| Current password required | Frontend, DTO (`[Required]`, unchanged) |
| New password required | Frontend, DTO (`[Required]`, unchanged) |
| Confirm password required | Frontend, DTO (`[Required]`, unchanged) |
| New password equality | Frontend, service (unchanged) |
| Current and new password must differ | **Added this task** — service-level check (`string.Equals(request.CurrentPassword, request.NewPassword, StringComparison.Ordinal)` → `BadRequest`, `"New password must be different from the current password."`), evaluated **before** the repository verify call so a same-password submission never even reaches the credential check. |
| Password policy | **Added this task**, same `AcutisAuthValidation` helper as Reset Password. |
| Safe failure response | Unchanged — verify-step failure returns the generic `"Current password is incorrect."` (never distinguishing "wrong current password" from "account doesn't exist" — there is only ever one authenticated caller here, so this is about not leaking *why* verification failed); the write step, still blocked pending a confirmed database write path, continues to return the explicit "not yet supported" message and never a false success (unchanged, re-verified). |

## Validation order (both Reset and Change Password)

To fail fast and avoid unnecessary repository/token-store calls, checks run in this order:
required fields → new/confirm equality → (Change Password only) current/new must differ →
password policy → token plausibility (Reset only) / credential verification (Change only) →
the actual write attempt (still blocked — see database-contract.md).

## Frontend enforcement — React Hook Form

All four forms (`LoginPage`, `ForgotPasswordPage`, `ResetPasswordPage`, `ChangePasswordPage`) now
use `react-hook-form`'s `useForm`/`register`/`handleSubmit`, replacing the prior hand-rolled
`useState` + `FormEvent` pattern. Per form:

- Typed `FormValues` interface per form (no `any`).
- `mode: 'onBlur'` with re-validation on change once a field has been touched — errors appear on
  blur (matching this repo's `frontend/CFR_Admin` precedent), not on every keystroke, but clear as
  soon as the user fixes them.
- Field-level errors render immediately below the field, associated via `aria-describedby` /
  `aria-invalid`, matching accessible-forms convention.
- A form-level error banner (`role="alert"`) shows only for server-side failures (never a raw
  backend exception — always the `ApiError.message`, which is itself always a safe, pre-shaped
  string per the backend rules above).
- `formState.isSubmitting` disables the submit button and blocks a second submit from firing while
  one is already in flight — this also covers "prevent duplicate submissions" without extra state.
- Non-password fields (`userName`/`email`) are **not** cleared after a recoverable error — the
  user doesn't have to retype their email after a wrong password. Password/new-password/confirm
  fields **are** cleared after a *successful* submission (Change/Reset Password) so a stale
  password never lingers in the DOM/form state longer than necessary.
- Backend field errors (`ApiError.fieldErrors`, populated from `MSResultArgs.errors`) are mapped
  onto the matching RHF field via `setError(field, { type: 'server', message })` — added this task
  to both `httpClient.ts` (`ApiError` gained an optional `fieldErrors` array) and every page.
- `401` → the existing global `onUnauthorized` handler (unchanged). `403` → the existing global
  `onForbidden` handler (unchanged). `429` → a safe, generic "Too many attempts — please wait and
  try again." form-level message (new — `httpClient.ts` did not previously special-case 429;
  no rate limiter is actually configured on `CFR.Acutis` itself today, so this is forward
  compatibility for the shared `CFR.Base` rate-limiter/gateway layer, not a claim that Acutis rate
  limits requests today). `500`/network failure → the existing generic fallback message (unchanged).
- No raw backend exception text is ever rendered — every message shown to the user originates from
  `ApiError.message`, which is always either a fixed frontend string or a backend `statusMessage`
  that is itself always one of the fixed, safe strings documented above (never `ex.Message`).

## Mock/real adapter consistency (Phase 5)

- Both adapters implement the exact same `AcutisAuthApi` TypeScript interface and throw the exact
  same `ApiError` shape (`message`, `httpStatus`, `domainStatusCode`, `fieldErrors`).
- The mock adapter's password-policy/equality/current-differs-from-new checks were added
  identically to the real backend's rules (same thresholds, same messages) so switching
  `VITE_ACUTIS_AUTH_MODE` never changes what a given input produces.
- Format validation (email shape, required fields) is intentionally **not** duplicated inside the
  mock adapter itself — both adapters are reached only after the same RHF client-side validation
  runs first, so the mock is not "more permissive" in the only way a user can actually reach it.
  This is documented here rather than pretending mock-mode reimplements ASP.NET Core's model
  binding.
- Development-only behavior remains clearly labeled in code comments: the mock adapter's one
  hardcoded credential pair, the "not yet supported" write-blockers, and the token store's
  in-memory (non-durable) nature are all called out at their definition sites, unchanged by this
  task except where the comments needed updating to mention the new policy checks.

## Explicitly out of scope (per task instruction)

- No password database write was implemented. Change/Reset Password's write step still returns
  the same "not yet supported" response as before this task — only the validation that runs
  *before* that point changed.
- No database schema, stored procedure, or migration was touched.
- No actual rate-limiting infrastructure was added to `CFR.Acutis` — only generic frontend handling
  for a `429` response, in case the shared gateway/platform layer ever produces one.
