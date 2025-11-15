export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = import.meta.env.VITE_APP_TITLE || "App";

export const APP_LOGO =
  import.meta.env.VITE_APP_LOGO ||
  "https://placehold.co/128x128/E1E7EF/1F2937?text=App";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL ?? "";
  const appId = import.meta.env.VITE_APP_ID ?? "";
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  // Use the configured OAuth portal URL when valid, otherwise fall back to the current origin.
  // Build the URL using the two-argument form so relative paths are handled safely.
  let base = oauthPortalUrl || window.location.origin;
  try {
    // Verify base is a valid absolute URL; if not, fallback to origin
    new URL(base);
  } catch {
    base = window.location.origin;
  }

  const url = new URL("/app-auth", base);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};