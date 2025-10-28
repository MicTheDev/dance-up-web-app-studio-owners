'use client';

import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Paper,
  Stack,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'workshop' | 'competition' | 'showcase' | 'other';
}

export default function EventsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    type: 'workshop' as Event['type'],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sample events data - in a real app, this would come from Firestore
  useEffect(() => {
    if (user) {
      // TODO: Fetch events from Firestore
      const sampleEvents: Event[] = [
        {
          id: '1',
          title: 'Summer Dance Workshop',
          description: 'A comprehensive workshop covering various dance styles',
          date: '2025-07-15',
          time: '10:00 AM',
          location: 'Main Studio',
          type: 'workshop',
        },
        {
          id: '2',
          title: 'Annual Recital',
          description: 'Our annual student recital showcasing talent from all classes',
          date: '2025-08-20',
          time: '6:00 PM',
          location: 'Community Theater',
          type: 'showcase',
        },
        {
          id: '3',
          title: 'Regional Dance Competition',
          description: 'Competition featuring studios from across the region',
          date: '2025-09-10',
          time: '9:00 AM',
          location: 'Convention Center',
          type: 'competition',
        },
      ];
      setEvents(sampleEvents);
    }
  }, [user]);

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

  const handleOpenDialog = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        type: 'workshop',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
  };

  const handleSaveEvent = () => {
    // TODO: Save to Firestore
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(e => e.id === editingEvent.id ? { ...editingEvent, ...formData } : e));
    } else {
      // Add new event
      const newEvent: Event = {
        id: Date.now().toString(),
        ...formData,
      };
      setEvents([...events, newEvent]);
    }
    handleCloseDialog();
  };

  const handleDeleteEvent = (id: string) => {
    // TODO: Delete from Firestore
    setEvents(events.filter(e => e.id !== id));
  };

  const getTypeColor = (type: Event['type']) => {
    switch (type) {
      case 'workshop':
        return 'primary';
      case 'competition':
        return 'error';
      case 'showcase':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Events
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Event
        </Button>
      </Box>

      {events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No events scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first event to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Event
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {event.title}
                    </Typography>
                    <Chip
                      label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                      color={getTypeColor(event.type) as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {event.description}
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {formatDate(event.date)} at {event.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">{event.location}</Typography>
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(event)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteEvent(event.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? 'Edit Event' : 'Add New Event'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Event Title"
              fullWidth
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Date"
                type="date"
                fullWidth
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Box>
            <TextField
              label="Location"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              select
              label="Event Type"
              fullWidth
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Event['type'] })}
              SelectProps={{ native: true }}
              inputProps={{ 'aria-label': 'Event Type' }}
            >
              <option value="workshop">Workshop</option>
              <option value="competition">Competition</option>
              <option value="showcase">Showcase</option>
              <option value="other">Other</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={!formData.title || !formData.date || !formData.time || !formData.location}
          >
            {editingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

