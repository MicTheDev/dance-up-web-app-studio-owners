'use client';

import { Box, Container, Typography, Stack, Link } from '@mui/material';
import FacebookIcon from '@mui/icons-material/Facebook';
import InstagramIcon from '@mui/icons-material/Instagram';
import TwitterIcon from '@mui/icons-material/Twitter';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 4,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          justifyContent="space-between"
          alignItems={{ xs: 'center', md: 'flex-start' }}
        >
          {/* Brand Section */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              DanceUp Studio Owners
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Manage your dance studio with ease
            </Typography>
          </Box>

          {/* Links Section */}
          <Stack direction="row" spacing={4}>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Company
              </Typography>
              <Stack spacing={0.5}>
                <Link href="/about" color="inherit" underline="hover">
                  <Typography variant="body2">About</Typography>
                </Link>
                <Link href="/contact" color="inherit" underline="hover">
                  <Typography variant="body2">Contact</Typography>
                </Link>
                <Link href="/support" color="inherit" underline="hover">
                  <Typography variant="body2">Support</Typography>
                </Link>
              </Stack>
            </Box>
            <Box>
              <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                Resources
              </Typography>
              <Stack spacing={0.5}>
                <Link href="/help" color="inherit" underline="hover">
                  <Typography variant="body2">Help Center</Typography>
                </Link>
                <Link href="/documentation" color="inherit" underline="hover">
                  <Typography variant="body2">Documentation</Typography>
                </Link>
                <Link href="/pricing" color="inherit" underline="hover">
                  <Typography variant="body2">Pricing</Typography>
                </Link>
              </Stack>
            </Box>
          </Stack>

          {/* Social Media */}
          <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
              Follow Us
            </Typography>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-end' }}>
              <Link href="#" color="inherit">
                <FacebookIcon />
              </Link>
              <Link href="#" color="inherit">
                <InstagramIcon />
              </Link>
              <Link href="#" color="inherit">
                <TwitterIcon />
              </Link>
            </Stack>
          </Box>
        </Stack>

        {/* Copyright */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255, 255, 255, 0.2)',
            mt: 3,
            pt: 3,
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            Studio Owners App © {currentYear} - Powered by DanceUp
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

