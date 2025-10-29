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
  CircularProgress,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIconOutline from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ComingSoonModal from '@/components/ComingSoonModal';
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

interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price?: number;
  maxParticipants: number;
  currentParticipants: number;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  imageUrl?: string;
}

export default function WorkshopsPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    instructor: '',
    date: '',
    time: '',
    duration: '',
    location: '',
    price: '',
    maxParticipants: '',
    currentParticipants: '0',
    level: 'all-levels' as Workshop['level'],
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

  // Fetch workshops from Firestore
  useEffect(() => {
    if (!user) return;

    const workshopsRef = collection(db, 'workshops');
    const q = query(workshopsRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const workshopsData: Workshop[] = [];
      querySnapshot.forEach((doc) => {
        workshopsData.push({ id: doc.id, ...doc.data() } as Workshop);
      });
      setWorkshops(workshopsData);
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

  const handleOpenDialog = (workshop?: Workshop) => {
    if (workshop) {
      setEditingWorkshop(workshop);
      setFormData({
        title: workshop.title,
        description: workshop.description,
        instructor: workshop.instructor,
        date: workshop.date,
        time: workshop.time,
        duration: workshop.duration,
        location: workshop.location,
        price: workshop.price?.toString() || '',
        maxParticipants: workshop.maxParticipants.toString(),
        currentParticipants: workshop.currentParticipants.toString(),
        level: workshop.level,
        imageUrl: workshop.imageUrl || '',
      });
      setImagePreview(workshop.imageUrl || '');
      setImageFile(null);
    } else {
      setEditingWorkshop(null);
      setFormData({
        title: '',
        description: '',
        instructor: '',
        date: '',
        time: '',
        duration: '',
        location: '',
        price: '',
        maxParticipants: '',
        currentParticipants: '0',
        level: 'all-levels',
        imageUrl: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWorkshop(null);
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
    if (editingWorkshop && editingWorkshop.imageUrl) {
      setFormData({ ...formData, imageUrl: '' });
    }
  };

  const handleSaveWorkshop = async () => {
    if (!user) return;

    setUploading(true);
    try {
      let imageUrl = formData.imageUrl;

      // Upload new image if one was selected
      if (imageFile) {
        const imageRef = ref(storage, `workshops/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);

        // Delete old image if updating
        if (editingWorkshop && editingWorkshop.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingWorkshop.imageUrl);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.error('Error deleting old image:', error);
          }
        }
      } else if (!imagePreview && editingWorkshop && editingWorkshop.imageUrl) {
        // Image was removed
        try {
          const oldImageRef = ref(storage, editingWorkshop.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
        imageUrl = '';
      }

      const workshopData = {
        title: formData.title,
        description: formData.description,
        instructor: formData.instructor,
        date: formData.date,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        maxParticipants: parseInt(formData.maxParticipants),
        currentParticipants: parseInt(formData.currentParticipants),
        level: formData.level,
        userId: user.uid,
        ...(imageUrl && { imageUrl }),
        ...(formData.price && formData.price !== '' && { price: parseFloat(formData.price) }),
      };

      if (editingWorkshop) {
        // Update existing workshop
        const workshopRef = doc(db, 'workshops', editingWorkshop.id);
        await updateDoc(workshopRef, workshopData);
      } else {
        // Add new workshop
        await addDoc(collection(db, 'workshops'), workshopData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving workshop:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (!user) return;

    try {
      const workshop = workshops.find(w => w.id === id);
      
      // Delete image from storage if it exists
      if (workshop?.imageUrl) {
        try {
          const imageRef = ref(storage, workshop.imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      const workshopRef = doc(db, 'workshops', id);
      await deleteDoc(workshopRef);
    } catch (error) {
      console.error('Error deleting workshop:', error);
    }
  };

  const getLevelColor = (level: Workshop['level']) => {
    switch (level) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'primary';
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

  if (showComingSoon) {
    return <ComingSoonModal featureName="Workshops" preventClose={true} onClose={() => setShowComingSoon(false)} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Workshops
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Workshop
        </Button>
      </Box>

      {workshops.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No workshops scheduled
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first workshop to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Workshop
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {workshops.map((workshop) => {
            const isFull = workshop.currentParticipants >= workshop.maxParticipants;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={workshop.id}>
                <Card elevation={2}>
                  {workshop.imageUrl && (
                    <Box
                      component="img"
                      src={workshop.imageUrl}
                      alt={workshop.title}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                      }}
                    />
                  )}
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {workshop.title}
                      </Typography>
                      <Chip
                        label={workshop.level.charAt(0).toUpperCase() + workshop.level.slice(1)}
                        color={getLevelColor(workshop.level) as any}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {workshop.description}
                    </Typography>
                    <Stack spacing={1.5}>
                      <Typography variant="body2">
                        <strong>Instructor:</strong> {workshop.instructor}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {formatDate(workshop.date)} at {workshop.time} ({workshop.duration})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">{workshop.location}</Typography>
                      </Box>
                      {workshop.price !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold">
                            ${workshop.price}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color={isFull ? 'error' : 'inherit'}>
                          {workshop.currentParticipants}/{workshop.maxParticipants} participants
                          {isFull && ' (Full)'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(workshop)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Add/Edit Workshop Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingWorkshop ? 'Edit Workshop' : 'Add New Workshop'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Workshop Title"
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
            <TextField
              label="Instructor"
              fullWidth
              value={formData.instructor}
              onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
              required
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
              label="Duration"
              fullWidth
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 2 hours"
              required
            />
            <TextField
              label="Location"
              fullWidth
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
            />
            <TextField
              label="Price ($)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              helperText="Optional"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Max Participants"
                type="number"
                fullWidth
                value={formData.maxParticipants}
                onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
              <TextField
                label="Current Participants"
                type="number"
                fullWidth
                value={formData.currentParticipants}
                onChange={(e) => setFormData({ ...formData, currentParticipants: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Box>
            <TextField
              select
              label="Level"
              fullWidth
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as Workshop['level'] })}
              SelectProps={{ 
                native: true,
                inputProps: { 
                  'aria-label': 'Workshop level',
                  title: 'Workshop level'
                }
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All Levels</option>
            </TextField>
            {/* Image Upload */}
            <Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Workshop Image (Optional)
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
            onClick={handleSaveWorkshop}
            variant="contained"
            disabled={!formData.title || !formData.instructor || !formData.date || !formData.time || !formData.location || !formData.maxParticipants || uploading}
          >
            {uploading ? <CircularProgress size={24} /> : editingWorkshop ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

