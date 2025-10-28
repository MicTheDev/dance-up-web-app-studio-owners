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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  CircularProgress,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIconOutline from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  imageUrl?: string;
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
    imageUrl: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch events from Firestore
  useEffect(() => {
    if (!user) return;

    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const eventsData: Event[] = [];
      querySnapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() } as Event);
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
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
        imageUrl: event.imageUrl || '',
      });
      setImagePreview(event.imageUrl || '');
      setImageFile(null);
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        imageUrl: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingEvent(null);
    setImagePreview('');
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (editingEvent && editingEvent.imageUrl) {
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const handleSaveEvent = async () => {
    if (!user) return;

    setUploading(true);
    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if one was selected
      if (imageFile) {
        const imageRef = ref(storage, `events/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);

        // Delete old image if updating
        if (editingEvent && editingEvent.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingEvent.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      } else if (!imagePreview && editingEvent && editingEvent.imageUrl) {
        // Image was removed
        try {
          const oldImageRef = ref(storage, editingEvent.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
        imageUrl = '';
      }

      const eventData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        userId: user.uid,
        ...(imageUrl && { imageUrl }),
      };

      if (editingEvent) {
        // Update existing event
        const eventRef = doc(db, 'events', editingEvent.id);
        await updateDoc(eventRef, eventData);
      } else {
        // Add new event
        await addDoc(collection(db, 'events'), eventData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!user) return;

    try {
      const event = events.find(e => e.id === id);
      
      // Delete image from storage if it exists
      if (event?.imageUrl) {
        try {
          const imageRef = ref(storage, event.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      const eventRef = doc(db, 'events', id);
      await deleteDoc(eventRef);
    } catch (error) {
      console.error('Error deleting event:', error);
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
            <Grid size={{ xs: 12, md: 6 }} key={event.id}>
              <Card elevation={2}>
                {event.imageUrl && (
                  <Box
                    component="img"
                    src={event.imageUrl}
                    alt={event.title}
                    sx={{
                      width: '100%',
                      height: 200,
                      objectFit: 'cover',
                    }}
                  />
                )}
                <CardContent>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {event.title}
                  </Typography>
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
            {/* Image Upload */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Event Image (Optional)
              </Typography>
              {imagePreview ? (
                <Box sx={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'cover',
                      borderRadius: 1,
                    }}
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
                    }}
                  >
                    <DeleteIconOutline />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<ImageIcon />}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  Upload Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={uploading}>Cancel</Button>
          <Button
            onClick={handleSaveEvent}
            variant="contained"
            disabled={!formData.title || !formData.date || !formData.time || !formData.location || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : editingEvent ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

