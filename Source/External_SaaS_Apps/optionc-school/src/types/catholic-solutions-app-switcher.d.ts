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
        'catalog-url'?: string;
        'app-hub-url'?: string;
      };
    }
  }
}

export {};
