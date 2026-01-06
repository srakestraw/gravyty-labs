/**
 * Navigation Foundation
 * 
 * Navigation components and patterns following MUI guidelines.
 * Includes navigation items, menus, breadcrumbs, and tabs.
 */

'use client';

import React from 'react';
import { Link, Button, ListItem, ListItemButton, ListItemIcon, ListItemText, Badge } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Navigation item props
 */
export interface NavigationItemProps {
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: number | string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: 0,
  '& .nav-item-active': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

/**
 * Navigation item component
 */
export function NavigationItem({
  href,
  onClick,
  icon,
  badge,
  active = false,
  disabled = false,
  children,
}: NavigationItemProps) {
  const content = (
    <>
      {icon && <ListItemIcon>{icon}</ListItemIcon>}
      <ListItemText primary={children} />
      {badge && (
        <Badge badgeContent={badge} color="primary" />
      )}
    </>
  );

  return (
    <StyledListItem disablePadding>
      {href ? (
        <ListItemButton
          component={Link}
          href={href}
          disabled={disabled}
          selected={active}
          className={active ? 'nav-item-active' : ''}
        >
          {content}
        </ListItemButton>
      ) : (
        <ListItemButton
          onClick={onClick}
          disabled={disabled}
          selected={active}
          className={active ? 'nav-item-active' : ''}
        >
          {content}
        </ListItemButton>
      )}
    </StyledListItem>
  );
}

/**
 * Navigation group for organizing items
 */
export interface NavigationGroupProps {
  title?: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function NavigationGroup({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
}: NavigationGroupProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  return (
    <div className="nav-group">
      {title && (
        <div 
          className="nav-group-header"
          onClick={() => collapsible && setExpanded(!expanded)}
        >
          <span>{title}</span>
          {collapsible && (
            <span>{expanded ? '▼' : '▶'}</span>
          )}
        </div>
      )}
      {expanded && <div className="nav-group-items">{children}</div>}
    </div>
  );
}

