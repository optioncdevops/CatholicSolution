import type { SVGProps } from 'react';

type Props = SVGProps<SVGSVGElement> & { size?: number };
function Base({ size = 18, children, ...props }: Props) { return <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{children}</svg>; }
export function PhoneIcon(props: Props) { return <Base {...props}><path d="M6.6 3h3l1.2 5-2 1.3a15 15 0 0 0 5.9 5.9l1.3-2 5 1.2v3c0 2-1.6 3.6-3.6 3.6C9.4 21 3 14.6 3 6.6 3 4.6 4.6 3 6.6 3Z"/></Base>; }
export function FileTextIcon(props: Props) { return <Base {...props}><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></Base>; }
export function ShieldCheckIcon(props: Props) { return <Base {...props}><path d="M12 3 5 6v5c0 4.4 2.5 7.7 7 10 4.5-2.3 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></Base>; }
