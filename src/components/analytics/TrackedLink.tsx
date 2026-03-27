'use client';

import Link from 'next/link';
import Clarity from '@microsoft/clarity';
import { ReactNode, MouseEvent } from 'react';

interface TrackedLinkProps {
  href: string;
  eventName: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void; // Explicitly type onClick
  [key: string]: unknown; 
}

/**
 * TrackedLink - A wrapper around Next.js Link that sends a custom event to Microsoft Clarity when clicked.
 */
export default function TrackedLink({ 
  href, 
  eventName, 
  children, 
  className, 
  onClick, 
  ...props 
}: TrackedLinkProps) {
  
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    try {
      Clarity.event(eventName);
    } catch (error) {
      console.error('Failed to track Clarity event:', error);
    }
    
    // CRITICAL: Fire the original onClick if it was passed in
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Link href={href} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  );
}
