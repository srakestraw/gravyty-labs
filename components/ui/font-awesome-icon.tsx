'use client';

import { useEffect, useState } from 'react';

interface FontAwesomeIconProps {
  icon: string;
  className?: string;
  style?: React.CSSProperties;
}

export function FontAwesomeIcon({ icon, className, style }: FontAwesomeIconProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Font Awesome is loaded
    const checkFontAwesome = () => {
      if (typeof window !== 'undefined' && (window as any).FontAwesome) {
        setIsLoaded(true);
      } else {
        // Retry after a short delay
        setTimeout(checkFontAwesome, 100);
      }
    };

    checkFontAwesome();
  }, []);

  if (!isLoaded) {
    // Return a placeholder div with the same dimensions
    return <div className={className} style={{ width: '1em', height: '1em', ...style }} />;
  }

  // Use the script-based approach with the kit
  return <i className={`fas ${icon} ${className || ''}`} style={style} />;
}
