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
  const combinedClassName = `${icon} ${className}`.trim();
  
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



