'use client';

import { useEffect, useState } from 'react';

interface FontAwesomeIconProps {
  icon: string;
  className?: string;
  size?: string;
  style?: React.CSSProperties;
  'aria-hidden'?: boolean;
}

export function FontAwesomeIcon({ 
  icon, 
  className = '', 
  size, 
  style, 
  'aria-hidden': ariaHidden = true 
}: FontAwesomeIconProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const combinedClassName = `${icon} ${className}`.trim();
  
  // During SSR or before mount, render a placeholder to prevent hydration mismatch
  if (!mounted) {
    return (
      <span 
        style={{ display: 'inline-block', width: '1em', height: '1em', ...style }}
        aria-hidden={ariaHidden}
        suppressHydrationWarning
      />
    );
  }
  
  // Wrap in a span that React can always safely manage
  // Using display: contents makes the wrapper transparent to layout
  // Font Awesome will transform the inner <i> element, but React
  // will always have the wrapper span to manage
  return (
    <span 
      style={{ display: 'contents', ...style }}
      aria-hidden={ariaHidden}
    >
      <i 
        className={combinedClassName}
        suppressHydrationWarning
      />
    </span>
  );
}



