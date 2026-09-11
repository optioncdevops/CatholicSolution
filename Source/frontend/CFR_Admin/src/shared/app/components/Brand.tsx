import { Link } from 'react-router-dom';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';
import catholicSolutionsLogoWebp from '@/assets/images/logo/catholic_solutions_logo.webp';
import catholicSolutionsLogoPng from '@/assets/images/logo/catholic_solutions_logo.png';

interface BrandProps {
  compact?: boolean;
  inverse?: boolean;
  prominent?: boolean;
  to?: string;
  local?: boolean;
}

// The standard Catholic Solutions logo image (src/assets/images/logo) is used everywhere the
// brand appears — nav, login, footer — instead of a text/glyph mark, so the real logo is
// consistent across the app. The source has a solid white background (no alpha), so it's
// framed in a white pill here rather than left to sit directly on `inverse` (dark) surfaces.
// Served as WebP (~17KB) with a PNG fallback (~45KB) for the rare browser without WebP support;
// both are pre-sized to the largest on-screen size this component ever renders at (see
// brand-lockup--prominent in styles.css), so there's no oversized source image to download.
export function Brand({ compact = false, inverse = false, prominent = false, to = '/apps', local = false }: BrandProps) {
  const sizeClass = prominent ? 'brand-lockup--prominent' : compact ? 'brand-lockup--compact' : 'brand-lockup--default';
  const className = `brand-lockup ${sizeClass} ${inverse ? 'brand-lockup--inverse' : ''}`;
  const content = (
    <span className="brand-lockup__image-frame">
      <picture>
        <source srcSet={catholicSolutionsLogoWebp} type="image/webp" />
        <img src={catholicSolutionsLogoPng} alt="" aria-hidden="true" className="brand-lockup__image" />
      </picture>
    </span>
  );

  return local
    ? <Link to={to} className={className} aria-label="Catholic Solutions home">{content}</Link>
    : <PlatformLink to={to} className={className} aria-label="Catholic Solutions home">{content}</PlatformLink>;
}
