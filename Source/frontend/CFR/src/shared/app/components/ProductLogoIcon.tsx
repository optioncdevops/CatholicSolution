import React, { useState } from 'react';
import type { CatalogApp } from '@shared/app/types/app';

type ProductLogoIconProps = {
  app: CatalogApp;
  className?: string;
  size?: number | string;
};

export function ProductLogoIcon({ app, className = '', size }: ProductLogoIconProps) {
  const [imageError, setImageError] = useState(false);

  const style: React.CSSProperties = {
    background: app.gradient,
    overflow: 'hidden',
  };
  if (size) {
    style.width = size;
    style.height = size;
  }

  const showImage = Boolean(app.logoUrl) && !imageError;

  return (
    <span className={className} style={style} aria-hidden="true">
      {showImage ? (
        <img
          src={app.logoUrl}
          alt=""
          className="size-full object-contain p-1"
          onError={() => setImageError(true)}
          loading="lazy"
        />
      ) : (
        <span>{app.icon || '✦'}</span>
      )}
    </span>
  );
}
