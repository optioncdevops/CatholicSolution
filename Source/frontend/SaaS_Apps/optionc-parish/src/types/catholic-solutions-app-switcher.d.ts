import type * as React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'catholic-solutions-app-switcher': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        'current-app-id'?: string;
        'current-app-name'?: string;
        'current-app-icon'?: string;
        'current-app-category'?: string;
        'catalog-url'?: string;
        'app-hub-url'?: string;
        'manifest-url'?: string;
        'accent-gradient'?: string;
        'hide-current-tile'?: boolean | '';
      };
    }
  }
}

export {};
