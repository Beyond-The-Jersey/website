// 24×24 stroke icons from handover/update-v3/design/source/Club-2col-v3.dc.html.
import type { ReactNode } from 'react';

function Icon({ size = 22, children }: { size?: number; children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const MailIcon = () => (
  <Icon>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3.5 6.5 L12 13 L20.5 6.5" />
  </Icon>
);

export const ShareIcon = () => (
  <Icon>
    <circle cx="18" cy="5" r="2.6" />
    <circle cx="6" cy="12" r="2.6" />
    <circle cx="18" cy="19" r="2.6" />
    <path d="M8.3 10.8 L15.7 6.3 M8.3 13.2 L15.7 17.7" />
  </Icon>
);

export const PeopleIcon = () => (
  <Icon>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3 20 C3 16.3 5.7 14 9 14 C12.3 14 15 16.3 15 20" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M16 14.1 C19 14.3 21 16.6 21 19.5" />
  </Icon>
);

export const SearchIcon = () => (
  <Icon>
    <circle cx="11" cy="11" r="6" />
    <path d="M15.5 15.5 L20.5 20.5" />
  </Icon>
);

export const BellIcon = () => (
  <Icon>
    <path d="M6 16 V11 A6 6 0 0 1 18 11 V16 L20 18 H4 Z" />
    <path d="M10 20.5 A2 2 0 0 0 14 20.5" />
  </Icon>
);

export const Chevron = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
    <path
      d="M3.5 6 L8 10.5 L12.5 6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
