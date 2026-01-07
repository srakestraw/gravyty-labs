/**
 * Icons Showcase Page
 * 
 * Demonstrates the icon system usage and available icons.
 */

'use client';

import React from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';
import { Icon } from '@/design-system/Foundations/icons';
import { iconRegistry } from '@/design-system/Foundations/icons';

export default function IconsPage() {
  // Group icons by category for display
  const iconsByCategory: Record<string, string[]> = {
    Navigation: ['arrow-left', 'arrow-right', 'arrow-up', 'arrow-down', 'menu', 'more-horiz'],
    Organization: ['star', 'search', 'filter', 'bookmark-empty'],
    Actions: ['add-square', 'delete-circle', 'edit', 'save-action-floppy', 'download', 'upload'],
    Users: ['user', 'group', 'add-user', 'user-circle'],
    System: ['settings', 'menu', 'calendar', 'dashboard'],
  };

  return (
    <Box sx={{ p: 4, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h1" component="h1" gutterBottom>
        Icons
      </Typography>
      
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Icon system using SVG icons from the Figma design system. Icons are organized by category
        and support multiple weight variants.
      </Typography>

      {/* Usage Examples */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Usage Examples
        </Typography>
        
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Box>
            <Typography variant="body2" gutterBottom>
              Basic usage:
            </Typography>
            <code style={{ display: 'block', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              {`<Icon name="arrow-left" size="medium" />`}
            </code>
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              With category and weight:
            </Typography>
            <code style={{ display: 'block', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              {`<Icon name="user" category="users" weight="dynamic" size="large" />`}
            </code>
          </Box>
          
          <Box>
            <Typography variant="body2" gutterBottom>
              With MUI color:
            </Typography>
            <code style={{ display: 'block', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
              {`<Icon name="check-circle" size="large" color="success" />`}
            </code>
          </Box>
        </Stack>
      </Paper>

      {/* Icon Grid by Category */}
      {Object.entries(iconsByCategory).map(([category, iconNames]) => (
        <Paper key={category} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h2" component="h2" gutterBottom>
            {category}
          </Typography>
          
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 3,
              mt: 1,
            }}
          >
            {iconNames.map((iconName) => (
              <Box
                key={iconName}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <Icon
                  name={iconName as any}
                  size="large"
                  sx={{ mb: 1 }}
                />
                <Typography variant="caption" align="center" sx={{ fontSize: '0.75rem' }}>
                  {iconName}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      ))}

      {/* Size Variants */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h2" component="h2" gutterBottom>
          Size Variants
        </Typography>
        
        <Stack direction="row" spacing={4} sx={{ mt: 2, alignItems: 'center' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Icon name="user" size="small" />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Small (16px)
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Icon name="user" size="medium" />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Medium (20px)
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Icon name="user" size="large" />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Large (24px)
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Implementation Notes */}
      <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="h3" component="h3" gutterBottom>
          Implementation Notes
        </Typography>
        
        <Typography variant="body2" component="div" sx={{ mt: 1 }}>
          <ul>
            <li>
              <strong>SVG Storage:</strong> Icons should be stored in{' '}
              <code>public/assets/icons/</code> organized by category
            </li>
            <li>
              <strong>Naming:</strong> Icon files should follow the pattern{' '}
              <code>{'{icon-name}-{weight}.svg'}</code> (e.g., <code>arrow-left-regular.svg</code>)
            </li>
            <li>
              <strong>Export from Figma:</strong> Export icons as SVG files with the following settings:
              <ul>
                <li>Format: SVG</li>
                <li>Include "id" attribute: No</li>
                <li>Outline stroke: Yes (if applicable)</li>
              </ul>
            </li>
            <li>
              <strong>Type Safety:</strong> Icon names are type-checked through the{' '}
              <code>IconName</code> type
            </li>
          </ul>
        </Typography>
      </Paper>
    </Box>
  );
}

