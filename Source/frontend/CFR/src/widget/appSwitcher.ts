/**
 * CFR App Switcher — standalone embeddable widget.
 *
 * Default mode - any external Catholic Solutions product renders the CFR
 * app-switcher with:
 *
 *   <script src="https://<cfr-origin-for-that-env>/integrations/app-switcher/app-switcher.js"
 *           data-cfr-gateway-origin="https://<cfr-gateway-origin-for-that-env>" defer></script>
 *
 * data-cfr-gateway-origin (from the host's own env config, e.g. SMS's
 * VITE_CFR_GATEWAY_ORIGIN) is required for this mode: it calls
 * {gatewayOrigin}/acutis/api/v1/Products/GetProducts, an anonymous, CORS-open
 * endpoint (see ProductsController.GetProducts). No CFR session/auth is
 * required or used; the switcher lists first-party apps only. No build-time
 * dependency on this repo either way - this widget bundle is identical
 * across every environment.
 *
 * Direct CFR.DataSync mode - a host that wants this user's real
 * CFR-accessible products (not just the first-party catalog) opts in with
 * data-cfr-datasync-base-url / -client-id / -client-secret on the script tag:
 *
 *   <script src="..." data-cfr-datasync-base-url="https://..."
 *           data-cfr-datasync-client-id="sms-client"
 *           data-cfr-datasync-client-secret="..." defer></script>
 *
 * The widget itself logs into CFR.DataSync (Auth/Login) with those
 * credentials, then calls ProductSync/GetUserProducts for the CFR member
 * whose email is in sessionStorage.cfrEmail (written by the host app at CFR
 * launch time) - entirely client-side, no host backend involved. Unlike
 * default mode, it renders nothing at all (no button, no fallback) when
 * there's no linked CFR identity or the calls fail, instead of an
 * empty/error panel.
 *
 * That same GetUserProducts call also mints a one-time App Hub platform-launch
 * code (see 005_Portal_PlatformLaunch.sql / PlatformLaunchController), so this
 * mode's "All apps in App Hub" footer link lands the visitor on CFR's own hub
 * already signed in, instead of CFR's login page. Clicking a product tile
 * mints its own one-time launch code on demand (Products/LaunchProduct, via
 * [dbo].[Portal_CFRLaunch] ActionId 4) - the same real, authenticated launch
 * CFR's own App Hub "Launch" button uses, not a bare link.
 *
 * An optional data-cfr-current-product-id on the script tag (the host's own
 * CFR [core].[Product].ProductId) marks that one tile as the current app -
 * shown but not clickable, so a visitor can't "launch" the app they're
 * already in.
 *
 * Either way, if the host page has an element with id="cfr-app-switcher-slot"
 * (e.g. an empty <div> placed inline in its own header icon row), the widget
 * renders its icon inside that slot, sized/colored to inherit the
 * surrounding icons' styling (currentColor). Otherwise it falls back to a
 * floating corner button.
 *
 * The CFR.Gateway origin used for logos (either mode) and for default
 * mode's product list comes from data-cfr-gateway-origin on the script tag
 * (see constants.ts) - supplied by the host from its own env config, not
 * baked in at CFR's own build time. Missing it in direct mode just means no
 * logos (falls back to a letter avatar); missing it in default mode means
 * the widget can't fetch a catalog at all, so it renders nothing.
 *
 * File layout: constants.ts / types.ts hold shared config and DTOs,
 * utils/switcherHelpers.ts has pure helpers, services/ holds the two API
 * clients (DataSync client-credentials calls vs. the anonymous default
 * catalog), and ui/ builds and mounts the DOM. This file only orchestrates
 * which mode runs.
 */
import { CFR_GATEWAY_ORIGIN, DATASYNC_BASE_URL, DATASYNC_CLIENT_ID, DATASYNC_CLIENT_SECRET, HOST_SESSION_EMAIL_KEY } from './constants';
import { fetchDirectDataSyncApps } from './services/dataSyncClient';
import { fetchLaunchableApps } from './services/productsClient';
import { mountSwitcher, waitForSlot } from './ui/render';
import { readHostSessionValue } from './utils/switcherHelpers';

async function init(): Promise<void> {
  if (DATASYNC_BASE_URL && DATASYNC_CLIENT_ID && DATASYNC_CLIENT_SECRET) {
    // Direct CFR.DataSync mode. No linked CFR identity in this tab at all means the widget
    // should show no trace of itself - bail before even waiting on a host slot element.
    const cfrEmail = readHostSessionValue(HOST_SESSION_EMAIL_KEY);
    if (!cfrEmail) return;

    // Resolving this visitor's products and waiting for an optional host slot element don't
    // depend on each other, so run them concurrently instead of paying for both in sequence.
    const [result, slotForHost] = await Promise.all([
      fetchDirectDataSyncApps(DATASYNC_BASE_URL, DATASYNC_CLIENT_ID, DATASYNC_CLIENT_SECRET, cfrEmail),
      waitForSlot(),
    ]);
    if (result === null) return;

    mountSwitcher(Promise.resolve(result.apps), slotForHost ?? document.body, Boolean(slotForHost), result.platformLaunchCode);
    return;
  }

  // Default (CFR-hosted) mode - needs the host-supplied gateway origin to fetch the catalog at
  // all, unlike direct mode where it's only needed for (optional) logo images.
  if (!CFR_GATEWAY_ORIGIN) {
    console.error('[app-switcher] Default mode needs data-cfr-gateway-origin on the script tag.');
    return;
  }

  const slot = await waitForSlot();
  if (slot) {
    mountSwitcher(fetchLaunchableApps(CFR_GATEWAY_ORIGIN), slot, true);
    return;
  }

  mountSwitcher(fetchLaunchableApps(CFR_GATEWAY_ORIGIN), document.body, false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void init());
} else {
  void init();
}
