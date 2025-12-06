'use client';

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
  // Always render with the icon class - Font Awesome will handle rendering
  // Using suppressHydrationWarning to prevent warnings about class differences
  // between server and client (Font Awesome loads on client)
  const combinedClassName = `${icon} ${className}`.trim();
  
  return (
    <i 
      className={combinedClassName}
      style={style}
      aria-hidden={ariaHidden}
      suppressHydrationWarning
    />
  );
}








