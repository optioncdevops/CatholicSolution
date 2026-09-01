export type HubSectionValue = 'your' | 'available' | 'future';

export interface HubProductApiItem {
  productId: string;
  productName: string;
  category: string;
  description: string;
  externalUrl: string;
  features: string[];
  hubSection: HubSectionValue;
  isActive: number;
  isAvailable: number;
}
