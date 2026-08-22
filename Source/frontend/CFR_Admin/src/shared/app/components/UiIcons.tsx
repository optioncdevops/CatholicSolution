import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function IconBase({ size = 18, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Diagonal arrow marking a control that opens its destination in a new browser tab. */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </IconBase>
  );
}

export function AppsIcon(props: IconProps) {
  return (
    <IconBase {...props}>
      {[5, 12, 19].flatMap((y) =>
        [5, 12, 19].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.35" fill="currentColor" stroke="none" />),
      )}
    </IconBase>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return <IconBase {...props}><path d="m7 10 5 5 5-5"/></IconBase>;
}

export function ArrowRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></IconBase>;
}

export function ArrowLeftIcon(props: IconProps) {
  return <IconBase {...props}><path d="M19 12H5"/><path d="m10 17-5-5 5-5"/></IconBase>;
}

export function UserIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.8-4 3.1-6 7-6s6.2 2 7 6"/></IconBase>;
}

export function LockIcon(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></IconBase>;
}

export function MailIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m4 7 8 6 8-6"/></IconBase>;
}

export function EyeIcon(props: IconProps) {
  return <IconBase {...props}><path d="M2.8 12s3.2-5 9.2-5 9.2 5 9.2 5-3.2 5-9.2 5-9.2-5-9.2-5Z"/><circle cx="12" cy="12" r="2.2"/></IconBase>;
}

export function EyeOffIcon(props: IconProps) {
  return <IconBase {...props}><path d="m3 3 18 18"/><path d="M10.6 7.1A9.4 9.4 0 0 1 12 7c6 0 9.2 5 9.2 5a13.7 13.7 0 0 1-2.1 2.6"/><path d="M6.2 6.2C4 7.7 2.8 12 2.8 12s3.2 5 9.2 5a9.8 9.8 0 0 0 3.1-.5"/></IconBase>;
}

export function ShieldCheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 5 6v5c0 4.4 2.5 7.7 7 10 4.5-2.3 7-5.6 7-10V6l-7-3Z"/><path d="m9 12 2 2 4-4"/></IconBase>;
}

export function HelpCircleIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M9.8 9a2.4 2.4 0 1 1 3.1 2.3c-.6.2-.9.7-.9 1.2v.5"/><path d="M12 17h.01"/></IconBase>;
}

export function LogOutIcon(props: IconProps) {
  return <IconBase {...props}><path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/><path d="M14 8l4 4-4 4"/><path d="M18 12H9"/></IconBase>;
}

export function CheckIcon(props: IconProps) {
  return <IconBase {...props}><path d="m5 12 4 4L19 6"/></IconBase>;
}

export function BuildingIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 21h16"/><path d="M6 21V7l6-4 6 4v14"/><path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/><path d="M10 21v-4h4v4"/></IconBase>;
}

export function SparklesIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3Z"/><path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z"/></IconBase>;
}

export function CalendarIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="5" width="18" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M3 10h18"/></IconBase>;
}

export function UsersIcon(props: IconProps) {
  return <IconBase {...props}><path d="M16 20c0-3-1.8-5-5-5s-5 2-5 5"/><circle cx="11" cy="8" r="3"/><path d="M18 9a2.5 2.5 0 1 1-1.2 4.7M18.5 15.5c1.6.6 2.5 2 2.5 4"/></IconBase>;
}

export function ClockIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></IconBase>;
}

export function ClipboardIcon(props: IconProps) {
  return <IconBase {...props}><rect x="5" y="4" width="14" height="17" rx="2.5"/><path d="M9 4.5V3h6v1.5M8 10h8M8 14h8M8 18h5"/></IconBase>;
}

export function PlusIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 5v14M5 12h14"/></IconBase>;
}

export function SearchIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></IconBase>;
}

export function MapPinIcon(props: IconProps) {
  return <IconBase {...props}><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></IconBase>;
}

export function AlertTriangleIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v4M12 17h.01"/></IconBase>;
}

export function MessageIcon(props: IconProps) {
  return <IconBase {...props}><path d="M4 5h16v11H9l-5 4V5Z"/><path d="M8 9h8M8 12h5"/></IconBase>;
}

export function DownloadIcon(props: IconProps) {
  return <IconBase {...props}><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></IconBase>;
}

export function UserPlusIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="9" cy="8" r="3"/><path d="M3 20c.6-3.6 2.6-5.5 6-5.5 1.5 0 2.7.3 3.7.9M17 8v6M14 11h6"/></IconBase>;
}

export function CheckCircleIcon(props: IconProps) {
  return <IconBase {...props}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></IconBase>;
}

export function ChevronRightIcon(props: IconProps) {
  return <IconBase {...props}><path d="m9 6 6 6-6 6"/></IconBase>;
}

export function QrCodeIcon(props: IconProps) {
  return <IconBase {...props}><rect x="4" y="4" width="5" height="5"/><rect x="15" y="4" width="5" height="5"/><rect x="4" y="15" width="5" height="5"/><path d="M15 15h2v2h-2zM18 15h2v5h-5v-2M12 4v4M12 12h3M12 16v4"/></IconBase>;
}

export function BellIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19h4"/></IconBase>;
}

export function FileTextIcon(props: IconProps) {
  return <IconBase {...props}><path d="M6 3h8l4 4v14H6V3Z"/><path d="M14 3v5h4M9 12h6M9 16h6"/></IconBase>;
}

export function StarIcon(props: IconProps) {
  return <IconBase {...props}><path d="m12 3 2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9L12 3Z"/></IconBase>;
}

export function PencilIcon(props: IconProps) {
  return <IconBase {...props}><path d="M13.5 4.5 19.5 10.5 8 22H2v-6L13.5 4.5Z"/><path d="M12 6l6 6"/></IconBase>;
}

export function CopyIcon(props: IconProps) {
  return <IconBase {...props}><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></IconBase>;
}

export function MonitorIcon(props: IconProps) {
  return <IconBase {...props}><rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 21h8M12 17v4"/></IconBase>;
}

export function SmartphoneIcon(props: IconProps) {
  return <IconBase {...props}><rect x="6.5" y="2.5" width="11" height="19" rx="2.2"/><path d="M11 19h2"/></IconBase>;
}

export function RefreshCwIcon(props: IconProps) {
  return <IconBase {...props}><path d="M21 12a9 9 0 0 1-15.3 6.4L3 16"/><path d="M3 12a9 9 0 0 1 15.3-6.4L21 8"/><path d="M3 21v-5h5M21 3v5h-5"/></IconBase>;
}

export function ArchiveIcon(props: IconProps) {
  return <IconBase {...props}><rect x="3" y="3" width="18" height="5" rx="1.3"/><path d="M5 8v11a1.6 1.6 0 0 0 1.6 1.6h10.8A1.6 1.6 0 0 0 19 19V8"/><path d="M10 12h4"/></IconBase>;
}
