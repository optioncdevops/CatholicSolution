const BADGE_COLOR_STYLES = {
  slate: {
    soft: "bg-slate-100 text-slate-700 dark:bg-slate-500/15 dark:text-slate-300",
    light: "bg-slate-50 text-slate-700 dark:bg-slate-500/10 dark:text-slate-300",
    subtle: "bg-slate-100/70 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300",
    solid: "bg-slate-600 text-white dark:bg-slate-500 dark:text-slate-50",
    outline:
      "border border-slate-200 bg-transparent text-slate-700 dark:border-slate-400/30 dark:text-slate-300",
    surface:
      "border border-slate-200/80 bg-white text-slate-700 shadow-sm dark:border-slate-400/20 dark:bg-slate-900/40 dark:text-slate-300",
  },
  gray: {
    soft: "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-300",
    light: "bg-gray-50 text-gray-700 dark:bg-gray-500/10 dark:text-gray-300",
    subtle: "bg-gray-100/70 text-gray-600 dark:bg-gray-500/10 dark:text-gray-300",
    solid: "bg-gray-600 text-white dark:bg-gray-500 dark:text-gray-50",
    outline:
      "border border-gray-200 bg-transparent text-gray-700 dark:border-gray-400/30 dark:text-gray-300",
    surface:
      "border border-gray-200/80 bg-white text-gray-700 shadow-sm dark:border-gray-400/20 dark:bg-gray-900/40 dark:text-gray-300",
  },
  zinc: {
    soft: "bg-zinc-100 text-zinc-700 dark:bg-zinc-500/15 dark:text-zinc-300",
    light: "bg-zinc-50 text-zinc-700 dark:bg-zinc-500/10 dark:text-zinc-300",
    subtle: "bg-zinc-100/70 text-zinc-600 dark:bg-zinc-500/10 dark:text-zinc-300",
    solid: "bg-zinc-600 text-white dark:bg-zinc-500 dark:text-zinc-50",
    outline:
      "border border-zinc-200 bg-transparent text-zinc-700 dark:border-zinc-400/30 dark:text-zinc-300",
    surface:
      "border border-zinc-200/80 bg-white text-zinc-700 shadow-sm dark:border-zinc-400/20 dark:bg-zinc-900/40 dark:text-zinc-300",
  },
  neutral: {
    soft: "bg-neutral-100 text-neutral-700 dark:bg-neutral-500/15 dark:text-neutral-300",
    light: "bg-neutral-50 text-neutral-700 dark:bg-neutral-500/10 dark:text-neutral-300",
    subtle: "bg-neutral-100/70 text-neutral-600 dark:bg-neutral-500/10 dark:text-neutral-300",
    solid: "bg-neutral-600 text-white dark:bg-neutral-500 dark:text-neutral-50",
    outline:
      "border border-neutral-200 bg-transparent text-neutral-700 dark:border-neutral-400/30 dark:text-neutral-300",
    surface:
      "border border-neutral-200/80 bg-white text-neutral-700 shadow-sm dark:border-neutral-400/20 dark:bg-neutral-900/40 dark:text-neutral-300",
  },
  stone: {
    soft: "bg-stone-100 text-stone-700 dark:bg-stone-500/15 dark:text-stone-300",
    light: "bg-stone-50 text-stone-700 dark:bg-stone-500/10 dark:text-stone-300",
    subtle: "bg-stone-100/70 text-stone-600 dark:bg-stone-500/10 dark:text-stone-300",
    solid: "bg-stone-600 text-white dark:bg-stone-500 dark:text-stone-50",
    outline:
      "border border-stone-200 bg-transparent text-stone-700 dark:border-stone-400/30 dark:text-stone-300",
    surface:
      "border border-stone-200/80 bg-white text-stone-700 shadow-sm dark:border-stone-400/20 dark:bg-stone-900/40 dark:text-stone-300",
  },
  red: {
    soft: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    light: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    subtle: "bg-red-100/70 text-red-600 dark:bg-red-500/10 dark:text-red-300",
    solid: "bg-red-600 text-white dark:bg-red-500 dark:text-red-50",
    outline:
      "border border-red-200 bg-transparent text-red-700 dark:border-red-400/30 dark:text-red-300",
    surface:
      "border border-red-200/80 bg-white text-red-700 shadow-sm dark:border-red-400/20 dark:bg-red-950/30 dark:text-red-300",
  },
  orange: {
    soft: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300",
    light: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
    subtle: "bg-orange-100/70 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300",
    solid: "bg-orange-600 text-white dark:bg-orange-500 dark:text-orange-50",
    outline:
      "border border-orange-200 bg-transparent text-orange-700 dark:border-orange-400/30 dark:text-orange-300",
    surface:
      "border border-orange-200/80 bg-white text-orange-700 shadow-sm dark:border-orange-400/20 dark:bg-orange-950/30 dark:text-orange-300",
  },
  amber: {
    soft: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
    light: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300",
    subtle: "bg-amber-100/70 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    solid: "bg-amber-500 text-amber-950 dark:bg-amber-400 dark:text-amber-950",
    outline:
      "border border-amber-200 bg-transparent text-amber-800 dark:border-amber-400/30 dark:text-amber-300",
    surface:
      "border border-amber-200/80 bg-white text-amber-800 shadow-sm dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-300",
  },
  yellow: {
    soft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/15 dark:text-yellow-300",
    light: "bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300",
    subtle: "bg-yellow-100/70 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-300",
    solid: "bg-yellow-400 text-yellow-950 dark:bg-yellow-400 dark:text-yellow-950",
    outline:
      "border border-yellow-200 bg-transparent text-yellow-800 dark:border-yellow-400/30 dark:text-yellow-300",
    surface:
      "border border-yellow-200/80 bg-white text-yellow-800 shadow-sm dark:border-yellow-400/20 dark:bg-yellow-950/30 dark:text-yellow-300",
  },
  lime: {
    soft: "bg-lime-100 text-lime-800 dark:bg-lime-500/15 dark:text-lime-300",
    light: "bg-lime-50 text-lime-800 dark:bg-lime-500/10 dark:text-lime-300",
    subtle: "bg-lime-100/70 text-lime-700 dark:bg-lime-500/10 dark:text-lime-300",
    solid: "bg-lime-500 text-lime-950 dark:bg-lime-400 dark:text-lime-950",
    outline:
      "border border-lime-200 bg-transparent text-lime-800 dark:border-lime-400/30 dark:text-lime-300",
    surface:
      "border border-lime-200/80 bg-white text-lime-800 shadow-sm dark:border-lime-400/20 dark:bg-lime-950/30 dark:text-lime-300",
  },
  green: {
    soft: "bg-green-100 text-green-800 dark:bg-green-500/15 dark:text-green-300",
    light: "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300",
    subtle: "bg-green-100/70 text-green-700 dark:bg-green-500/10 dark:text-green-300",
    solid: "bg-green-600 text-white dark:bg-green-500 dark:text-green-50",
    outline:
      "border border-green-200 bg-transparent text-green-800 dark:border-green-400/30 dark:text-green-300",
    surface:
      "border border-green-200/80 bg-white text-green-800 shadow-sm dark:border-green-400/20 dark:bg-green-950/30 dark:text-green-300",
  },
  emerald: {
    soft: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
    light: "bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300",
    subtle: "bg-emerald-100/70 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    solid: "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-emerald-50",
    outline:
      "border border-emerald-200 bg-transparent text-emerald-800 dark:border-emerald-400/30 dark:text-emerald-300",
    surface:
      "border border-emerald-200/80 bg-white text-emerald-800 shadow-sm dark:border-emerald-400/20 dark:bg-emerald-950/30 dark:text-emerald-300",
  },
  teal: {
    soft: "bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-300",
    light: "bg-teal-50 text-teal-800 dark:bg-teal-500/10 dark:text-teal-300",
    subtle: "bg-teal-100/70 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300",
    solid: "bg-teal-600 text-white dark:bg-teal-500 dark:text-teal-50",
    outline:
      "border border-teal-200 bg-transparent text-teal-800 dark:border-teal-400/30 dark:text-teal-300",
    surface:
      "border border-teal-200/80 bg-white text-teal-800 shadow-sm dark:border-teal-400/20 dark:bg-teal-950/30 dark:text-teal-300",
  },
  cyan: {
    soft: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-300",
    light: "bg-cyan-50 text-cyan-800 dark:bg-cyan-500/10 dark:text-cyan-300",
    subtle: "bg-cyan-100/70 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300",
    solid: "bg-cyan-600 text-white dark:bg-cyan-500 dark:text-cyan-50",
    outline:
      "border border-cyan-200 bg-transparent text-cyan-800 dark:border-cyan-400/30 dark:text-cyan-300",
    surface:
      "border border-cyan-200/80 bg-white text-cyan-800 shadow-sm dark:border-cyan-400/20 dark:bg-cyan-950/30 dark:text-cyan-300",
  },
  sky: {
    soft: "bg-sky-100 text-sky-800 dark:bg-sky-500/15 dark:text-sky-300",
    light: "bg-sky-50 text-sky-800 dark:bg-sky-500/10 dark:text-sky-300",
    subtle: "bg-sky-100/70 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300",
    solid: "bg-sky-600 text-white dark:bg-sky-500 dark:text-sky-50",
    outline:
      "border border-sky-200 bg-transparent text-sky-800 dark:border-sky-400/30 dark:text-sky-300",
    surface:
      "border border-sky-200/80 bg-white text-sky-800 shadow-sm dark:border-sky-400/20 dark:bg-sky-950/30 dark:text-sky-300",
  },
  blue: {
    soft: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
    light: "bg-blue-50 text-blue-800 dark:bg-blue-500/10 dark:text-blue-300",
    subtle: "bg-blue-100/70 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    solid: "bg-blue-600 text-white dark:bg-blue-500 dark:text-blue-50",
    outline:
      "border border-blue-200 bg-transparent text-blue-800 dark:border-blue-400/30 dark:text-blue-300",
    surface:
      "border border-blue-200/80 bg-white text-blue-800 shadow-sm dark:border-blue-400/20 dark:bg-blue-950/30 dark:text-blue-300",
  },
  indigo: {
    soft: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-300",
    light: "bg-indigo-50 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-300",
    subtle: "bg-indigo-100/70 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
    solid: "bg-indigo-600 text-white dark:bg-indigo-500 dark:text-indigo-50",
    outline:
      "border border-indigo-200 bg-transparent text-indigo-800 dark:border-indigo-400/30 dark:text-indigo-300",
    surface:
      "border border-indigo-200/80 bg-white text-indigo-800 shadow-sm dark:border-indigo-400/20 dark:bg-indigo-950/30 dark:text-indigo-300",
  },
  violet: {
    soft: "bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300",
    light: "bg-violet-50 text-violet-800 dark:bg-violet-500/10 dark:text-violet-300",
    subtle: "bg-violet-100/70 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300",
    solid: "bg-violet-600 text-white dark:bg-violet-500 dark:text-violet-50",
    outline:
      "border border-violet-200 bg-transparent text-violet-800 dark:border-violet-400/30 dark:text-violet-300",
    surface:
      "border border-violet-200/80 bg-white text-violet-800 shadow-sm dark:border-violet-400/20 dark:bg-violet-950/30 dark:text-violet-300",
  },
  purple: {
    soft: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300",
    light: "bg-purple-50 text-purple-800 dark:bg-purple-500/10 dark:text-purple-300",
    subtle: "bg-purple-100/70 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300",
    solid: "bg-purple-600 text-white dark:bg-purple-500 dark:text-purple-50",
    outline:
      "border border-purple-200 bg-transparent text-purple-800 dark:border-purple-400/30 dark:text-purple-300",
    surface:
      "border border-purple-200/80 bg-white text-purple-800 shadow-sm dark:border-purple-400/20 dark:bg-purple-950/30 dark:text-purple-300",
  },
  fuchsia: {
    soft: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-500/15 dark:text-fuchsia-300",
    light: "bg-fuchsia-50 text-fuchsia-800 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
    subtle: "bg-fuchsia-100/70 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300",
    solid: "bg-fuchsia-600 text-white dark:bg-fuchsia-500 dark:text-fuchsia-50",
    outline:
      "border border-fuchsia-200 bg-transparent text-fuchsia-800 dark:border-fuchsia-400/30 dark:text-fuchsia-300",
    surface:
      "border border-fuchsia-200/80 bg-white text-fuchsia-800 shadow-sm dark:border-fuchsia-400/20 dark:bg-fuchsia-950/30 dark:text-fuchsia-300",
  },
  pink: {
    soft: "bg-pink-100 text-pink-800 dark:bg-pink-500/15 dark:text-pink-300",
    light: "bg-pink-50 text-pink-800 dark:bg-pink-500/10 dark:text-pink-300",
    subtle: "bg-pink-100/70 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300",
    solid: "bg-pink-600 text-white dark:bg-pink-500 dark:text-pink-50",
    outline:
      "border border-pink-200 bg-transparent text-pink-800 dark:border-pink-400/30 dark:text-pink-300",
    surface:
      "border border-pink-200/80 bg-white text-pink-800 shadow-sm dark:border-pink-400/20 dark:bg-pink-950/30 dark:text-pink-300",
  },
  rose: {
    soft: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-300",
    light: "bg-rose-50 text-rose-800 dark:bg-rose-500/10 dark:text-rose-300",
    subtle: "bg-rose-100/70 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300",
    solid: "bg-rose-600 text-white dark:bg-rose-500 dark:text-rose-50",
    outline:
      "border border-rose-200 bg-transparent text-rose-800 dark:border-rose-400/30 dark:text-rose-300",
    surface:
      "border border-rose-200/80 bg-white text-rose-800 shadow-sm dark:border-rose-400/20 dark:bg-rose-950/30 dark:text-rose-300",
  },
} as const;

type BadgeColorName = keyof typeof BADGE_COLOR_STYLES;
type BadgeStyleName = keyof (typeof BADGE_COLOR_STYLES)["slate"];
type GeneratedDataTableBadgeVariant = `${BadgeColorName}${Capitalize<BadgeStyleName>}`;

const DATA_TABLE_BADGE_VARIANT_ALIASES = {
  blue: BADGE_COLOR_STYLES.blue.soft,
  green: BADGE_COLOR_STYLES.green.soft,
  yellow: BADGE_COLOR_STYLES.yellow.soft,
  red: BADGE_COLOR_STYLES.red.soft,
  gray: BADGE_COLOR_STYLES.slate.soft,
  outlined: BADGE_COLOR_STYLES.blue.outline,
  outlinedGray: BADGE_COLOR_STYLES.slate.outline,
} as const;

type DataTableBadgeAlias = keyof typeof DATA_TABLE_BADGE_VARIANT_ALIASES;

export type DataTableBadgeVariant = GeneratedDataTableBadgeVariant | DataTableBadgeAlias;

export function resolveDataTableBadgeVariant(variant: DataTableBadgeVariant) {
  if (variant in DATA_TABLE_BADGE_VARIANT_ALIASES) {
    return DATA_TABLE_BADGE_VARIANT_ALIASES[variant as DataTableBadgeAlias];
  }

  const resolvedVariant = Object.keys(BADGE_COLOR_STYLES).find((colorName) =>
    variant.startsWith(colorName),
  );

  if (!resolvedVariant) {
    return DATA_TABLE_BADGE_VARIANT_ALIASES.blue;
  }

  const color = resolvedVariant as BadgeColorName;
  const styleName = variant.slice(color.length) as Capitalize<BadgeStyleName>;
  const style = (styleName.charAt(0).toLowerCase() + styleName.slice(1)) as BadgeStyleName;

  return BADGE_COLOR_STYLES[color][style] ?? DATA_TABLE_BADGE_VARIANT_ALIASES.blue;
}
