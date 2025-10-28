'use client';

import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardHome() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  const stats = [
    {
      title: 'Total Classes',
      value: '12',
      icon: <DashboardIcon sx={{ fontSize: 40 }} />,
      color: 'primary.main',
    },
    {
      title: 'Active Students',
      value: '156',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      color: 'success.main',
    },
    {
      title: 'This Week Classes',
      value: '24',
      icon: <CalendarTodayIcon sx={{ fontSize: 40 }} />,
      color: 'info.main',
    },
    {
      title: 'Locations',
      value: '2',
      icon: <StoreIcon sx={{ fontSize: 40 }} />,
      color: 'secondary.main',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Welcome back, {user.email?.split('@')[0]}!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Here's an overview of your studio
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: stat.color,
                      width: 64,
                      height: 64,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Recent Activity
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your recent activity will appear here...
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                • Add new class
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • Register student
              </Typography>
              <Typography variant="body2" color="text.secondary">
                • View schedule
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

