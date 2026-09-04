// UploadProfileImage returns a relative path (e.g. /uploads/profile/xyz.png) served by the
// Acutis microservice's static files, not this frontend's own origin. VITE_APP_REST_API_BASE_URL
// already carries any gateway prefix itself (see AxiosInstance.ts), so it's prefixed as-is —
// no extra prefix guessing/insertion.
export function resolveProfileImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) return trimmed;
  const apiBase = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '').replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${apiBase}${cleanPath}`;
}
