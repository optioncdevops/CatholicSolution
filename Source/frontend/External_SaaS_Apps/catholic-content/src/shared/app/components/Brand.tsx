import { Link } from 'react-router-dom';
import { PlatformLink } from '@shared/platform/navigation/PlatformLink';

interface BrandProps {
  compact?: boolean;
  inverse?: boolean;
  prominent?: boolean;
  to?: string;
  local?: boolean;
}

export function Brand({ compact = false, inverse = false, prominent = false, to = '/apps', local = false }: BrandProps) {
  const sizeClass = prominent ? 'brand-lockup--prominent' : compact ? 'brand-lockup--compact' : 'brand-lockup--default';
  const className = `brand-lockup ${sizeClass} ${inverse ? 'brand-lockup--inverse' : ''}`;
  const content = (
    <>
      <span className="brand-lockup__symbol" aria-hidden="true">✝</span>
      <span className="brand-lockup__wordmark">
        <span className="brand-lockup__name">Catholic</span>
        <span className="brand-lockup__subname">SOLUTIONS</span>
      </span>
    </>
  );

  return local
    ? <Link to={to} className={className} aria-label="Catholic Solutions home">{content}</Link>
    : <PlatformLink to={to} className={className} aria-label="Catholic Solutions home">{content}</PlatformLink>;
}
