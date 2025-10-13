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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // During SSR, render a placeholder div with the same dimensions
  if (!isClient) {
    return (
      <div 
        className={`inline-block ${className}`}
        style={{
          width: size === 'lg' ? '24px' : size === '2x' ? '32px' : '16px',
          height: size === 'lg' ? '24px' : size === '2x' ? '32px' : '16px',
          ...style
        }}
        aria-hidden={ariaHidden}
      />
    );
  }

  // On client side, render the actual Font Awesome icon
  return (
    <i 
      className={`${icon} ${className}`}
      style={style}
      aria-hidden={ariaHidden}
    />
  );
}
