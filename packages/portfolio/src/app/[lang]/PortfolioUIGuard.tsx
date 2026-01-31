'use client';

import { usePathname } from 'next/navigation';
import React from 'react';

/**
 * A guard component that hides its children if the current route is the seedlings page.
 * This is used to isolate the seedlings poll from the portfolio's global UI elements
 * like the hexagonal background, menu, and special cursors.
 */
export default function PortfolioUIGuard({
  children,
  inverse = false,
}: {
  children: React.ReactNode;
  inverse?: boolean;
}) {
  const pathname = usePathname();

  // Normalize path to check if it's the seedlings page (localized or not)
  const isSeedlings = pathname?.includes('/seedlings');

  if (inverse) {
    return isSeedlings ? <>{children}</> : null;
  }

  if (isSeedlings) {
    return null;
  }

  return <>{children}</>;
}
