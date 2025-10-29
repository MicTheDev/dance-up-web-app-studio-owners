'use client';

import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import HomeIcon from '@mui/icons-material/Home';
import { useRouter } from 'next/navigation';

interface ComingSoonModalProps {
  featureName: string;
  onClose?: () => void;
  preventClose?: boolean;
}

export default function ComingSoonModal({ 
  featureName, 
  onClose,
  preventClose = false 
}: ComingSoonModalProps) {
  const router = useRouter();

  // Handle escape key and backdrop click
  const handleClose = () => {
    if (preventClose) {
      return;
    }
    if (onClose) {
      onClose();
    }
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  return (
    <Dialog
      open={true}
      onClose={preventClose ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={preventClose}
      PaperProps={{
        sx: {
          borderRadius: 3,
          textAlign: 'center',
        },
        onClick: (e) => {
          e.stopPropagation();
        },
      }}
      slotProps={{
        backdrop: {
          onClick: preventClose ? undefined : handleClose,
          sx: {
            pointerEvents: preventClose ? 'none' : 'auto',
          },
        },
      }}
    >
      <DialogContent sx={{ pt: 4, pb: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <ConstructionIcon sx={{ fontSize: 48, color: 'white' }} />
          </Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Coming Soon!
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The <strong>{featureName}</strong> feature is currently under development
            and will be available soon.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            We're working hard to bring you an amazing experience. Stay tuned!
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, px: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
          sx={{ minWidth: 200 }}
        >
          Go to Dashboard
        </Button>
      </DialogActions>
    </Dialog>
  );
}

