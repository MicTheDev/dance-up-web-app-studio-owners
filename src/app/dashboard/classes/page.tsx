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
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import ComingSoonModal from '@/components/ComingSoonModal';
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
  getDocs,
  onSnapshot 
} from 'firebase/firestore';

interface Class {
  id: string;
  name: string;
  description: string;
  instructor: string;
  day: string;
  time: string;
  duration: string;
  location: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  price?: number;
}

export default function ClassesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    instructor: '',
    day: '',
    time: '',
    duration: '',
    location: '',
    level: 'all-levels' as Class['level'],
    maxStudents: '',
    currentStudents: '0',
    isActive: true,
    price: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch classes from Firestore
  useEffect(() => {
    if (!user) return;

    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classesData: Class[] = [];
      querySnapshot.forEach((doc) => {
        classesData.push({ id: doc.id, ...doc.data() } as Class);
      });
      setClasses(classesData);
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

  const handleOpenDialog = (classItem?: Class) => {
    if (classItem) {
      setEditingClass(classItem);
      setFormData({
        name: classItem.name,
        description: classItem.description,
        instructor: classItem.instructor,
        day: classItem.day,
        time: classItem.time,
        duration: classItem.duration,
        location: classItem.location,
        level: classItem.level,
        maxStudents: classItem.maxStudents.toString(),
        currentStudents: classItem.currentStudents.toString(),
        isActive: classItem.isActive,
        price: classItem.price?.toString() || '',
      });
    } else {
      setEditingClass(null);
      setFormData({
        name: '',
        description: '',
        instructor: '',
        day: '',
        time: '',
        duration: '',
        location: '',
        level: 'all-levels',
        maxStudents: '',
        currentStudents: '0',
        isActive: true,
        price: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingClass(null);
  };

  const handleSaveClass = async () => {
    if (!user) return;

    try {
      const classData = {
        name: formData.name,
        description: formData.description,
        instructor: formData.instructor,
        day: formData.day,
        time: formData.time,
        duration: formData.duration,
        location: formData.location,
        level: formData.level,
        maxStudents: parseInt(formData.maxStudents),
        currentStudents: parseInt(formData.currentStudents),
        isActive: formData.isActive,
        userId: user.uid,
        ...(formData.price && formData.price !== '' && { price: parseFloat(formData.price) }),
      };

      if (editingClass) {
        // Update existing class
        const classRef = doc(db, 'classes', editingClass.id);
        await updateDoc(classRef, classData);
      } else {
        // Add new class
        await addDoc(collection(db, 'classes'), classData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving class:', error);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!user) return;

    try {
      const classRef = doc(db, 'classes', id);
      await deleteDoc(classRef);
    } catch (error) {
      console.error('Error deleting class:', error);
    }
  };

  const toggleActive = async (id: string) => {
    if (!user) return;

    try {
      const classItem = classes.find(c => c.id === id);
      if (!classItem) return;

      const classRef = doc(db, 'classes', id);
      await updateDoc(classRef, { isActive: !classItem.isActive });
    } catch (error) {
      console.error('Error updating class:', error);
    }
  };

  const getLevelColor = (level: Class['level']) => {
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

  if (showComingSoon) {
    return <ComingSoonModal featureName="Classes" preventClose={true} onClose={() => setShowComingSoon(false)} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Classes
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Class
        </Button>
      </Box>

      {classes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No classes available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first class to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Class
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {classes.map((classItem) => {
            const isFull = classItem.currentStudents >= classItem.maxStudents;
            return (
              <Grid size={{ xs: 12, md: 6 }} key={classItem.id}>
                <Card elevation={2}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {classItem.name}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={classItem.isActive ? 'Active' : 'Inactive'}
                          color={classItem.isActive ? 'success' : 'default'}
                          size="small"
                        />
                        <Chip
                          label={classItem.level.charAt(0).toUpperCase() + classItem.level.slice(1)}
                          color={getLevelColor(classItem.level) as any}
                          size="small"
                        />
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {classItem.description}
                    </Typography>
                    <Stack spacing={1.5}>
                      <Typography variant="body2">
                        <strong>Instructor:</strong> {classItem.instructor}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {classItem.day} at {classItem.time} ({classItem.duration})
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOnIcon fontSize="small" color="action" />
                        <Typography variant="body2">{classItem.location}</Typography>
                      </Box>
                      {classItem.price !== undefined && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoneyIcon fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="bold">
                            ${classItem.price}
                          </Typography>
                        </Box>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PeopleIcon fontSize="small" color="action" />
                        <Typography variant="body2" color={isFull ? 'error' : 'inherit'}>
                          {classItem.currentStudents}/{classItem.maxStudents} students
                          {isFull && ' (Full)'}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(classItem)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color={classItem.isActive ? 'warning' : 'success'}
                      onClick={() => toggleActive(classItem.id)}
                    >
                      {classItem.isActive ? '✓' : '○'}
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClass(classItem.id)}
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

      {/* Add/Edit Class Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClass ? 'Edit Class' : 'Add New Class'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Class Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
            <TextField
              select
              label="Day"
              fullWidth
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              SelectProps={{ 
                native: true,
                inputProps: { 
                  'aria-label': 'Class day',
                  title: 'Class day'
                }
              }}
              required
            >
              <option value="">Select a day</option>
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Time"
                type="time"
                fullWidth
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                label="Duration"
                fullWidth
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 1 hour"
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
              label="Price ($)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              helperText="Optional"
            />
            <TextField
              select
              label="Level"
              fullWidth
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as Class['level'] })}
              SelectProps={{ 
                native: true,
                inputProps: { 
                  'aria-label': 'Class level',
                  title: 'Class level'
                }
              }}
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="all-levels">All Levels</option>
            </TextField>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Max Students"
                type="number"
                fullWidth
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                InputProps={{ inputProps: { min: 1 } }}
                required
              />
              <TextField
                label="Current Students"
                type="number"
                fullWidth
                value={formData.currentStudents}
                onChange={(e) => setFormData({ ...formData, currentStudents: e.target.value })}
                InputProps={{ inputProps: { min: 0 } }}
                required
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSaveClass}
            variant="contained"
            disabled={!formData.name || !formData.instructor || !formData.day || !formData.time || !formData.location || !formData.maxStudents}
          >
            {editingClass ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
