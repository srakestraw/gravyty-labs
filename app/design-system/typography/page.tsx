'use client';

import { Box, Container, Divider, Stack } from '@mui/material';
import { 
  H1, H2, H3, H4, H5, 
  S1, S2,
  B1, B2, B3, B4, B5, B6,
  C1, C2, C3,
  Label,
  ButtonGiant, ButtonLarge, ButtonMedium, ButtonSmall, ButtonTiny
} from '@/design-system/Foundations';

export default function TypographyShowcasePage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <H1 sx={{ mb: 4 }}>Typography Showcase</H1>
      <B1 sx={{ mb: 6, color: 'text.secondary' }}>
        This page demonstrates all typography styles from the Gravyty Design System.
        All measurements match the Figma design specifications.
      </B1>

      {/* Headlines */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Headlines</H2>
        <Stack spacing={2}>
          <Box>
            <Label sx={{ mb: 1 }}>H1. Headline</Label>
            <H1>The quick brown fox jumps over the lazy dog</H1>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>H2. Headline</Label>
            <H2>The quick brown fox jumps over the lazy dog</H2>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>H3. Headline</Label>
            <H3>The quick brown fox jumps over the lazy dog</H3>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>H4. Headline</Label>
            <H4>The quick brown fox jumps over the lazy dog</H4>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>H5. Headline</Label>
            <H5>The quick brown fox jumps over the lazy dog</H5>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Subtitles */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Subtitles</H2>
        <Stack spacing={2}>
          <Box>
            <Label sx={{ mb: 1 }}>S1. Subtitle</Label>
            <S1>The quick brown fox jumps over the lazy dog</S1>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>S2. Subtitle</Label>
            <S2>The quick brown fox jumps over the lazy dog</S2>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Body */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Body Text</H2>
        <Stack spacing={2}>
          <Box>
            <Label sx={{ mb: 1 }}>B1. Body (Regular, 14px)</Label>
            <B1>
              The quick brown fox jumps over the lazy dog. This is body text at 14px with regular weight.
            </B1>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>B2. Body (Medium, 14px)</Label>
            <B2>
              The quick brown fox jumps over the lazy dog. This is body text at 14px with medium weight.
            </B2>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>B3. Body (Regular, 13px)</Label>
            <B3>
              The quick brown fox jumps over the lazy dog. This is body text at 13px with regular weight.
            </B3>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>B4. Body (Medium, 13px)</Label>
            <B4>
              The quick brown fox jumps over the lazy dog. This is body text at 13px with medium weight.
            </B4>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>B5. Body (Regular, 12px)</Label>
            <B5>
              The quick brown fox jumps over the lazy dog. This is body text at 12px with regular weight.
            </B5>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>B6. Body (Medium, 12px)</Label>
            <B6>
              The quick brown fox jumps over the lazy dog. This is body text at 12px with medium weight.
            </B6>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Captions */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Captions</H2>
        <Stack spacing={2}>
          <Box>
            <Label sx={{ mb: 1 }}>C1. Caption (Regular, 11px)</Label>
            <C1>The quick brown fox jumps over the lazy dog</C1>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>C2. Caption (Medium, 11px)</Label>
            <C2>The quick brown fox jumps over the lazy dog</C2>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>C3. Caption (Medium, 10px)</Label>
            <C3>The quick brown fox jumps over the lazy dog</C3>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Label */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Label</H2>
        <Box>
          <Label sx={{ mb: 1 }}>Label (Medium, 12px, Uppercase)</Label>
          <Label>The quick brown fox jumps over the lazy dog</Label>
        </Box>
      </Box>

      <Divider sx={{ my: 6 }} />

      {/* Button Font */}
      <Box sx={{ mb: 6 }}>
        <H2 sx={{ mb: 3 }}>Button Font</H2>
        <Stack spacing={2}>
          <Box>
            <Label sx={{ mb: 1 }}>Button Giant (Semi Bold, 18px)</Label>
            <ButtonGiant>Button Text</ButtonGiant>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>Button Large (Semi Bold, 16px)</Label>
            <ButtonLarge>Button Text</ButtonLarge>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>Button Medium (Medium, 13px)</Label>
            <ButtonMedium>Button Text</ButtonMedium>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>Button Small (Semi Bold, 12px)</Label>
            <ButtonSmall>Button Text</ButtonSmall>
          </Box>
          <Box>
            <Label sx={{ mb: 1 }}>Button Tiny (Semi Bold, 10px)</Label>
            <ButtonTiny>Button Text</ButtonTiny>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
}

