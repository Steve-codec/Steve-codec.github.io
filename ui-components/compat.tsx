import React from 'react';

// Hexo renders normal links; the Rare UI component remains a React component.
export default function Link(props: React.ComponentProps<'a'>) {
  return <a {...props} />;
}
export function usePathname() { return window.location.pathname.replace(/\/$/, '') || '/'; }
export function cn(...classes: (string | false | undefined)[]) { return classes.filter(Boolean).join(' '); }
