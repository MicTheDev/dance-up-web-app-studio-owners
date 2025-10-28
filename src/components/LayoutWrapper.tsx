'use client';

import { usePathname } from 'next/navigation';
import { Box } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  // Don't show header/footer on dashboard pages or login page
  if (isDashboard || pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Header />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
}

