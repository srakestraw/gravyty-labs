/**
 * Icon Component
 * 
 * Unified icon component that can render SVG icons from the Figma design system.
 * Supports both SVG file loading and inline SVG rendering.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { SvgIcon, SvgIconProps, useTheme } from '@mui/material';
import { IconName, IconCategory, IconWeight, IconSize, getIconPath } from './icon-registry';

export interface IconProps extends Omit<SvgIconProps, 'children'> {
  /**
   * Icon name from the registry
   */
  name: IconName;
  
  /**
   * Icon category (auto-detected from registry if not provided)
   */
  category?: IconCategory;
  
  /**
   * Icon weight/style variant
   * @default 'regular'
   */
  weight?: IconWeight;
  
  /**
   * Icon size
   * @default 'medium'
   */
  size?: IconSize;
  
  /**
   * Custom SVG content (for inline SVG)
   */
  svgContent?: string;
  
  /**
   * Fallback icon (Font Awesome class) if SVG not found
   */
  fallback?: string;
}

const iconSizeMap: Record<string, string> = {
  small: '1rem',      // 16px
  medium: '1.25rem',  // 20px
  large: '1.5rem',    // 24px
  inherit: 'inherit',
};

/**
 * Icon component that renders SVG icons from the design system
 * 
 * @example
 * <Icon name="arrow-left" size="medium" />
 * <Icon name="user" category="users" weight="dynamic" />
 * <Icon name="search" size="large" color="primary" />
 */
export function Icon({
  name,
  category,
  weight = 'regular',
  size = 'medium',
  svgContent,
  fallback,
  sx,
  ...props
}: IconProps) {
  const theme = useTheme();
  const [svg, setSvg] = useState<string | null>(svgContent || null);
  const [loading, setLoading] = useState(!svgContent);
  const [error, setError] = useState(false);
  const [parsedSvg, setParsedSvg] = useState<{ viewBox: string; children: React.ReactNode[] } | null>(null);

  // Determine icon path
  const iconPath = category 
    ? getIconPath(category, name, weight)
    : `/assets/icons/${name}-${weight}.svg`;

  // Load SVG content
  useEffect(() => {
    if (svgContent) {
      setSvg(svgContent);
      setLoading(false);
      return;
    }

    // Try to load SVG from path
    fetch(iconPath)
      .then((res) => {
        if (!res.ok) throw new Error('Icon not found');
        return res.text();
      })
      .then((content) => {
        setSvg(content);
        setLoading(false);
        setError(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [iconPath, svgContent]);

  // Calculate size
  const sizeValue = typeof size === 'string' && size in iconSizeMap
    ? iconSizeMap[size]
    : size;

  // Render fallback if error and fallback provided
  if (error && fallback) {
    return (
      <SvgIcon
        sx={{
          fontSize: sizeValue,
          ...sx,
        }}
        {...props}
      >
        {/* Fallback to Font Awesome or placeholder */}
        <path d="M0 0h24v24H0z" fill="none" />
      </SvgIcon>
    );
  }

  // Render loading state
  if (loading) {
    return (
      <SvgIcon
        sx={{
          fontSize: sizeValue,
          opacity: 0.3,
          ...sx,
        }}
        {...props}
      >
        <path d="M0 0h24v24H0z" fill="none" />
      </SvgIcon>
    );
  }

  // Parse SVG content on client side
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const contentToParse = svgContent || svg;
    if (!contentToParse) return;

    try {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(contentToParse, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;
      
      // Get viewBox
      const viewBox = svgElement.getAttribute('viewBox') || '0 0 24 24';
      
      // Get all child elements (paths, circles, etc.)
      const children: React.ReactNode[] = [];
      Array.from(svgElement.children).forEach((child, index) => {
        if (child.tagName === 'path') {
          children.push(
            <path
              key={`path-${index}`}
              d={child.getAttribute('d') || ''}
              fill={child.getAttribute('fill') || 'currentColor'}
              stroke={child.getAttribute('stroke')}
              strokeWidth={child.getAttribute('stroke-width')}
            />
          );
        } else if (child.tagName === 'circle') {
          children.push(
            <circle
              key={`circle-${index}`}
              cx={child.getAttribute('cx') || '12'}
              cy={child.getAttribute('cy') || '12'}
              r={child.getAttribute('r') || '12'}
              fill={child.getAttribute('fill') || 'currentColor'}
            />
          );
        } else if (child.tagName === 'rect') {
          children.push(
            <rect
              key={`rect-${index}`}
              x={child.getAttribute('x') || '0'}
              y={child.getAttribute('y') || '0'}
              width={child.getAttribute('width') || '24'}
              height={child.getAttribute('height') || '24'}
              fill={child.getAttribute('fill') || 'currentColor'}
            />
          );
        }
        // Add more element types as needed
      });

      setParsedSvg({ viewBox, children });
    } catch (error) {
      console.error('Error parsing SVG:', error);
      setError(true);
    }
  }, [svg, svgContent]);

  // Render parsed SVG
  if (parsedSvg) {
    return (
      <SvgIcon
        viewBox={parsedSvg.viewBox}
        sx={{
          fontSize: sizeValue,
          ...sx,
        }}
        {...props}
      >
        {parsedSvg.children.length > 0 ? parsedSvg.children : <path d="M0 0h24v24H0z" fill="none" />}
      </SvgIcon>
    );
  }

  // Default empty icon
  return (
    <SvgIcon
      sx={{
        fontSize: sizeValue,
        ...sx,
      }}
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" />
    </SvgIcon>
  );
}

/**
 * Inline SVG Icon component
 * For when you have the SVG content directly
 */
export interface InlineIconProps extends Omit<SvgIconProps, 'children'> {
  svgContent: string;
  size?: IconSize;
}

export function InlineIcon({ svgContent, size = 'medium', sx, ...props }: InlineIconProps) {
  return <Icon name="" svgContent={svgContent} size={size} sx={sx} {...props} />;
}

