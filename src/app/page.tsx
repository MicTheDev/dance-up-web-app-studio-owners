'use client';

import { useState } from 'react';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Stack,
  Paper,
} from '@mui/material';

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <Box
      sx={{
        background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
        minHeight: '100%',
        py: 4,
      }}
    >
      {/* Main Content */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              p: 6,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
              color: 'white',
            }}
          >
            <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
              Welcome to Studio Owners
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }} paragraph>
              Manage your dance studio with ease using DanceUp
            </Typography>
          </Paper>

          {/* Features Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Manage Studios
                </Typography>
                <Typography color="text.secondary">
                  Track and manage all your studio locations in one place
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Track Classes
                </Typography>
                <Typography color="text.secondary">
                  Monitor class schedules, attendance, and student progress
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Connect Students
                </Typography>
                <Typography color="text.secondary">
                  Build a community and keep students engaged and motivated
                </Typography>
              </CardContent>
            </Card>
          </Box>

          {/* Interactive Section */}
          <Paper elevation={0} sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" gutterBottom fontWeight="bold">
                Get Started
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Click the button below to see HMR in action
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => setCount((count) => count + 1)}
                sx={{ mr: 2 }}
              >
                Count: {count}
              </Button>
              <Button variant="outlined" size="large" href="#">
                Learn More
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Built with Next.js, Material UI, and TypeScript
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>
    </Box>
  );
}
