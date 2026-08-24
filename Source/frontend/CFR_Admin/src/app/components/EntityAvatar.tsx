const PALETTE = [
  'linear-gradient(135deg,#1E3A8A,#3B82F6)',
  'linear-gradient(135deg,#166534,#22C55E)',
  'linear-gradient(135deg,#0F766E,#34D399)',
  'linear-gradient(135deg,#B91C1C,#EF4444)',
  'linear-gradient(135deg,#5B21B6,#8B5CF6)',
  'linear-gradient(135deg,#D97706,#FBBF24)',
  'linear-gradient(135deg,#075985,#0EA5E9)',
  'linear-gradient(135deg,#9F1239,#F43F5E)',
];

function hashGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function initials(name: string) {
  return name.trim().split(/\s+/).filter(Boolean).map((word) => word[0]).slice(0, 2).join('').toUpperCase() || '•';
}

interface EntityAvatarProps {
  name: string;
  size?: number;
  square?: boolean;
}

/** Consistent color-coded initials badge for organizations and users across list/detail views. */
export function EntityAvatar({ name, size = 32, square = false }: EntityAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center font-extrabold text-white ${square ? 'rounded-lg' : 'rounded-full'}`}
      style={{ width: size, height: size, background: hashGradient(name), fontSize: size * 0.38 }}
    >
      {initials(name)}
    </span>
  );
}
