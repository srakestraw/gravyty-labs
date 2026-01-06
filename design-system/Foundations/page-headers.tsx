/**
 * Page Headers Foundation
 * 
 * Page header components following MUI patterns.
 * Provides consistent page title, breadcrumbs, and action areas.
 */

'use client';

import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * Page header container
 */
const HeaderContainer = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

/**
 * Page header props
 */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode;
  backButton?: React.ReactNode;
}

/**
 * Page header component
 * 
 * @example
 * <PageHeader
 *   title="Dashboard"
 *   subtitle="Overview of your account"
 *   breadcrumbs={[
 *     { label: 'Home', href: '/' },
 *     { label: 'Dashboard' }
 *   ]}
 *   actions={<Button>Action</Button>}
 * />
 */
export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  actions,
  backButton,
}: PageHeaderProps) {
  return (
    <HeaderContainer>
      <Stack spacing={2}>
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return isLast ? (
                <Typography key={index} color="text.primary">
                  {crumb.label}
                </Typography>
              ) : (
                <Link
                  key={index}
                  href={crumb.href || '#'}
                  color="inherit"
                  underline="hover"
                >
                  {crumb.label}
                </Link>
              );
            })}
          </Breadcrumbs>
        )}

        {/* Title and actions row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            {backButton && (
              <Box sx={{ mb: 1 }}>
                {backButton}
              </Box>
            )}
            <Typography variant="h4" component="h1" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body1" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {actions && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
              {actions}
            </Box>
          )}
        </Box>
      </Stack>
    </HeaderContainer>
  );
}

/**
 * Section header (for subsections)
 */
export interface SectionHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function SectionHeader({
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
      <Box>
        <Typography variant="h6" component="h2" gutterBottom>
          {title}
        </Typography>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      {actions && <Box>{actions}</Box>}
    </Box>
  );
}

