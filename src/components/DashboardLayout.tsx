'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  Drawer,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import StoreIcon from '@mui/icons-material/Store';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import EventIcon from '@mui/icons-material/Event';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import InventoryIcon from '@mui/icons-material/Inventory';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const DRAWER_WIDTH = 280;

interface NavItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: 'Main',
    items: [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Studio', icon: <StoreIcon />, path: '/dashboard/studio' },
      { text: 'Schedule', icon: <CalendarTodayIcon />, path: '/dashboard/schedule' },
      { text: 'Students', icon: <PeopleIcon />, path: '/dashboard/students' },
    ],
  },
  {
    title: 'Content',
    items: [
      { text: 'Classes', icon: <SchoolIcon />, path: '/dashboard/classes' },
      { text: 'Events', icon: <EventIcon />, path: '/dashboard/events' },
      { text: 'Packages', icon: <InventoryIcon />, path: '/dashboard/packages' },
      { text: 'Workshops', icon: <MenuBookIcon />, path: '/dashboard/workshops' },
    ],
  },
  {
    title: 'Other',
    items: [
      { text: 'Analytics', icon: <BarChartIcon />, path: '/dashboard/analytics' },
      { text: 'Settings', icon: <SettingsIcon />, path: '/dashboard/settings' },
    ],
  },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user] = useAuthState(auth);
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
      handleMenuClose();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleProfile = () => {
    router.push('/dashboard/profile');
    handleMenuClose();
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: [1],
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MusicNoteIcon color="primary" />
          <Typography variant="h6" noWrap component="div" fontWeight="bold">
            Studio Owners
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navigationSections.map((section, sectionIndex) => (
          <Box key={section.title}>
            {sectionIndex > 0 && <Divider sx={{ my: 1 }} />}
            {section.title && (
              <Typography
                variant="caption"
                sx={{
                  px: 2.5,
                  py: 1,
                  color: 'text.secondary',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  fontSize: '0.7rem',
                  letterSpacing: '0.05em',
                }}
              >
                {section.title}
              </Typography>
            )}
            {section.items.map((item) => {
              const isActive = pathname === item.path || pathname?.startsWith(item.path + '/');
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => {
                      router.push(item.path);
                      if (isMobile) {
                        setMobileOpen(false);
                      }
                    }}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'flex-start',
                      px: 2.5,
                      '&.Mui-selected': {
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        '&:hover': {
                          backgroundColor: 'primary.dark',
                        },
                        '& .MuiListItemIcon-root': {
                          color: 'primary.contrastText',
                        },
                      },
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: 3,
                        justifyContent: 'center',
                        color: isActive ? 'primary.contrastText' : 'inherit',
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton
            onClick={async () => {
              try {
                await signOut(auth);
                router.push('/');
                if (isMobile) {
                  setMobileOpen(false);
                }
              } catch (error) {
                console.error('Error signing out:', error);
              }
            }}
            sx={{
              minHeight: 48,
              justifyContent: 'flex-start',
              px: 2.5,
              '&:hover': {
                backgroundColor: 'error.light',
                color: 'error.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'error.contrastText',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: 3,
                justifyContent: 'center',
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile Menu Button - Show only on mobile at top */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          display: { xs: 'block', md: 'none' },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <MusicNoteIcon color="primary" />
            <Typography variant="h6" noWrap fontWeight="bold">
              Studio Owners
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                size="large"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.email?.charAt(0).toUpperCase() || <AccountCircleIcon />}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem onClick={handleProfile}>
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Box>

      {/* Sidebar Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: 'background.default',
          pt: { xs: '80px', md: 3 }, // Add top padding on mobile for menu bar
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

