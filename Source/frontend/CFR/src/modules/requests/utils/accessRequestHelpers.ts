import type { CatalogApp } from '@shared/app/types/app';
import type { CurrentUser } from '@shared/app/context/UserContext';
import type { SaveAccessRequestPayload } from '../types/accessRequestTypes';

export const toSaveAccessRequestPayload = (app: CatalogApp, user: CurrentUser): SaveAccessRequestPayload => ({
  productId: app.id.trim(),
  productName: app.name.trim(),
  requesterName: user.name.trim(),
  requesterEmail: user.email.trim(),
});
