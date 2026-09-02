export type HubSectionValue = 'your' | 'available' | 'future';

export interface HubProductApiItem {
  productId: number | string;
  productName: string;
  subCategoryName?: string | null;
  category?: string;
  prodDescription?: string | null;
  description?: string;
  externalPageUrl?: string | null;
  externalUrl?: string;
  logoUrl?: string | null;
  features?: string[];
  hubSection?: HubSectionValue;
  isActive: boolean | number;
  isAvailable: boolean | number;
}
