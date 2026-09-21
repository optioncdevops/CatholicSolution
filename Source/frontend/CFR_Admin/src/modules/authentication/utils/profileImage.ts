import { getAcutisPublicUrl } from '@app/config/gateway';

// UploadProfileImage returns a relative path (e.g. /uploads/profile/xyz.png) served by the
// Acutis microservice through CFR.Gateway (`/acutis/...`).
export function resolveProfileImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) return trimmed;
  return getAcutisPublicUrl(trimmed);
}
