import type { ProductApiItem } from '../types/productTypes';
import type { ProductStatus } from '@/modules/types';

export const THEME_LOOKUP: Record<string, { icon: string; gradient: string }> = {
  'optionc school': { icon: '🎓', gradient: 'linear-gradient(135deg,#1E3A8A,#3B82F6)' },
  'parish hub': { icon: '✝️', gradient: 'linear-gradient(135deg,#166534,#22C55E)' },
  'acutis lms': { icon: '📖', gradient: 'linear-gradient(135deg,#7C2D12,#EA580C)' },
  'matt money': { icon: '💰', gradient: 'linear-gradient(135deg,#0F766E,#34D399)' },
  'arc alerts': { icon: '🔔', gradient: 'linear-gradient(135deg,#B91C1C,#EF4444)' },
  'catholic content': { icon: '📚', gradient: 'linear-gradient(135deg,#5B21B6,#8B5CF6)' },
  'unified directory': { icon: '👥', gradient: 'linear-gradient(135deg,#075985,#0EA5E9)' },
  'support center': { icon: '🛟', gradient: 'linear-gradient(135deg,#164E63,#0E7490)' },
  'ai website builder': { icon: '🌐', gradient: 'linear-gradient(135deg,#1D4ED8,#38BDF8)' },
  'camp finder': { icon: '⛺', gradient: 'linear-gradient(135deg,#151032,#4E4870)' },
  'berchmans': { icon: '🗓️', gradient: 'linear-gradient(135deg,#15803D,#4ADE80)' },
};

const KEYWORD_RULES: Array<{ keywords: string[]; icon: string; gradient: string }> = [
  {
    keywords: ['sms', 'message', 'messaging', 'chat', 'comm'],
    icon: '💬',
    gradient: 'linear-gradient(135deg,#6D28D9,#8B5CF6)',
  },
  {
    keywords: ['clever', 'integration', 'sync', 'connect', 'api'],
    icon: '🔗',
    gradient: 'linear-gradient(135deg,#1E3A8A,#4F46E5)',
  },
  {
    keywords: ['portal', 'central', 'access', 'gateway', 'cfr portal'],
    icon: '🌐',
    gradient: 'linear-gradient(135deg,#0E7490,#06B6D4)',
  },
  {
    keywords: ['sample', 'test', 'testing', 'demo', 'lab'],
    icon: '🧪',
    gradient: 'linear-gradient(135deg,#047857,#10B981)',
  },
  {
    keywords: ['finance', 'money', 'billing', 'pay', 'payment', 'donation', 'tuition'],
    icon: '💳',
    gradient: 'linear-gradient(135deg,#0F766E,#34D399)',
  },
  {
    keywords: ['school', 'student', 'grade', 'academic', 'lms', 'learn'],
    icon: '🎓',
    gradient: 'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  },
  {
    keywords: ['parish', 'church', 'faith', 'sacrament', 'ministry', 'catholic'],
    icon: '✝️',
    gradient: 'linear-gradient(135deg,#166534,#22C55E)',
  },
  {
    keywords: ['alert', 'notify', 'notification', 'warning', 'broadcast'],
    icon: '🔔',
    gradient: 'linear-gradient(135deg,#B91C1C,#EF4444)',
  },
  {
    keywords: ['security', 'auth', 'identity', 'protect', 'shield'],
    icon: '🛡️',
    gradient: 'linear-gradient(135deg,#991B1B,#DC2626)',
  },
  {
    keywords: ['analytics', 'report', 'data', 'stat', 'insight'],
    icon: '📊',
    gradient: 'linear-gradient(135deg,#4338CA,#6366F1)',
  },
  {
    keywords: ['event', 'calendar', 'schedule', 'planning'],
    icon: '📅',
    gradient: 'linear-gradient(135deg,#15803D,#4ADE80)',
  },
  {
    keywords: ['ai', 'bot', 'smart', 'automation'],
    icon: '🤖',
    gradient: 'linear-gradient(135deg,#7C2D12,#EA580C)',
  },
];

const FALLBACK_GRADIENTS = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#047857,#10B981)',
  'linear-gradient(135deg,#6D28D9,#8B5CF6)',
  'linear-gradient(135deg,#0E7490,#06B6D4)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#BE185D,#EC4899)',
  'linear-gradient(135deg,#C2410C,#F97316)',
  'linear-gradient(135deg,#4338CA,#6366F1)',
];

const FALLBACK_ICONS = ['🚀', '⚡', '🌟', '💎', '🎯', '🧩', '🏷️', '🔮', '✨', '🛠️'];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getProductTheme(name: string, category?: string | null): { icon: string; gradient: string } {
  const normalized = (name || '').toLowerCase().trim();
  if (THEME_LOOKUP[normalized]) {
    return THEME_LOOKUP[normalized];
  }

  const combinedText = `${normalized} ${(category || '').toLowerCase().trim()}`;
  for (const rule of KEYWORD_RULES) {
    if (rule.keywords.some((keyword) => combinedText.includes(keyword))) {
      return {
        icon: rule.icon,
        gradient: rule.gradient,
      };
    }
  }

  const hash = hashString(normalized);
  const gradient = FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
  const icon = FALLBACK_ICONS[hash % FALLBACK_ICONS.length];

  return { icon, gradient };
}

export function deriveProductStatus(item: ProductApiItem): ProductStatus {
  if (!item.isAvailable) return 'coming-soon';
  return item.isActive ? 'active' : 'inactive';
}

export const normalizeProductList = (resultData: unknown): ProductApiItem[] => {
  if (!Array.isArray(resultData)) {
    return [];
  }
  return resultData as ProductApiItem[];
};

export function resolveProductLogoUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl || typeof logoUrl !== 'string' || !logoUrl.trim()) {
    return null;
  }
  const trimmed = logoUrl.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:') || /^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const apiBase = String(import.meta.env.VITE_APP_REST_API_BASE_URL ?? '').replace(/\/+$/, '');
  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const finalPath = cleanPath.startsWith('/acutis') ? cleanPath : `/acutis${cleanPath}`;
  return `${apiBase}${finalPath}`;
}

