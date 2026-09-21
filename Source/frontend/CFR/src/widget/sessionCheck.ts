/**
 * CFR session-check page — loaded in a hidden iframe by the app-switcher
 * widget (see appSwitcher.ts). Runs at CFR's own origin, so it can read
 * CFR's own cached Portal session directly — no cookie, no cross-domain
 * network call. Reports the result to whichever window opened this iframe
 * via postMessage.
 *
 * Reads the same dedicated, narrow-purpose localStorage key CFR's frontend
 * writes after exchanging an Auth0 login for a CFR-signed Portal JWT (see
 * auth0Session.ts, persistAuth0Session). It deliberately does NOT read the
 * app's own cfr_portal_token — that one lives in sessionStorage, which is
 * scoped per-tab and invisible to a hidden iframe opened from a different
 * top-level page (e.g. this widget embedded in an external product).
 */

const APP_SWITCHER_SESSION_KEY = 'cfr_app_switcher_session';

export type SessionCheckMessage =
  | { source: 'cfr-app-switcher'; loggedIn: false }
  | { source: 'cfr-app-switcher'; loggedIn: true; token: string };

function reply(message: SessionCheckMessage): void {
  // targetOrigin '*': the embedding host's origin isn't known in advance
  // (any external product can embed this widget). See docs/APP_SWITCHER.md
  // for the accepted tradeoff this implies.
  window.parent.postMessage(message, '*');
}

function checkSession(): void {
  let token: string | null = null;
  try {
    token = localStorage.getItem(APP_SWITCHER_SESSION_KEY);
  } catch {
    token = null;
  }

  if (!token) {
    reply({ source: 'cfr-app-switcher', loggedIn: false });
    return;
  }

  reply({ source: 'cfr-app-switcher', loggedIn: true, token });
}

checkSession();
