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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
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

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  numberOfClasses: number;
  validityDays: number;
  isActive: boolean;
  classIds?: string[];
}

interface Class {
  id: string;
  name: string;
}

export default function PackagesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [packages, setPackages] = useState<Package[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showComingSoon, setShowComingSoon] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    numberOfClasses: '',
    validityDays: '',
    isActive: true,
    classIds: [] as string[],
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch packages from Firestore
  useEffect(() => {
    if (!user) return;

    const packagesRef = collection(db, 'packages');
    const q = query(packagesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const packagesData: Package[] = [];
      querySnapshot.forEach((doc) => {
        packagesData.push({ id: doc.id, ...doc.data() } as Package);
      });
      setPackages(packagesData);
    });

    return () => unsubscribe();
  }, [user]);

  // Fetch classes from Firestore
  useEffect(() => {
    if (!user) return;

    const classesRef = collection(db, 'classes');
    const q = query(classesRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const classesData: Class[] = [];
      querySnapshot.forEach((doc) => {
        classesData.push({ id: doc.id, name: doc.data().name } as Class);
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

  const handleOpenDialog = (pkg?: Package) => {
    if (pkg) {
      setEditingPackage(pkg);
      setFormData({
        name: pkg.name,
        description: pkg.description,
        price: pkg.price.toString(),
        numberOfClasses: pkg.numberOfClasses.toString(),
        validityDays: pkg.validityDays.toString(),
        isActive: pkg.isActive,
        classIds: pkg.classIds || [],
      });
    } else {
      setEditingPackage(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        numberOfClasses: '',
        validityDays: '',
        isActive: true,
        classIds: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPackage(null);
  };

  const handleSavePackage = async () => {
    if (!user) return;

    try {
      const packageData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        numberOfClasses: parseInt(formData.numberOfClasses),
        validityDays: parseInt(formData.validityDays),
        isActive: formData.isActive,
        userId: user.uid,
        classIds: formData.classIds,
      };

      if (editingPackage) {
        // Update existing package
        const packageRef = doc(db, 'packages', editingPackage.id);
        await updateDoc(packageRef, packageData);
      } else {
        // Add new package
        await addDoc(collection(db, 'packages'), packageData);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!user) return;

    try {
      const packageRef = doc(db, 'packages', id);
      await deleteDoc(packageRef);
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const toggleActive = async (id: string) => {
    if (!user) return;

    try {
      const pkg = packages.find(p => p.id === id);
      if (!pkg) return;

      const packageRef = doc(db, 'packages', id);
      await updateDoc(packageRef, { isActive: !pkg.isActive });
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  if (showComingSoon) {
    return <ComingSoonModal featureName="Packages" preventClose={true} onClose={() => setShowComingSoon(false)} />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Packages
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Package
        </Button>
      </Box>

      {packages.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No packages available
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first package to get started
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Package
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {packages.map((pkg) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={pkg.id}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {pkg.name}
                    </Typography>
                    <Chip
                      label={pkg.isActive ? 'Active' : 'Inactive'}
                      color={pkg.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {pkg.description}
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AttachMoneyIcon fontSize="small" color="action" />
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        ${pkg.price}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <InventoryIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {pkg.numberOfClasses === 999 ? 'Unlimited' : pkg.numberOfClasses} classes
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Valid for {pkg.validityDays} days
                    </Typography>
                    <Box>
                      <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                        Applies to:
                      </Typography>
                      {pkg.classIds && pkg.classIds.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {pkg.classIds.map((classId) => {
                            const classItem = classes.find(c => c.id === classId);
                            return classItem ? (
                              <Chip
                                key={classId}
                                label={classItem.name}
                                size="small"
                                variant="outlined"
                              />
                            ) : null;
                          })}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          All classes
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleOpenDialog(pkg)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color={pkg.isActive ? 'warning' : 'success'}
                    onClick={() => toggleActive(pkg.id)}
                  >
                    {pkg.isActive ? '✓' : '○'}
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeletePackage(pkg.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Package Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPackage ? 'Edit Package' : 'Add New Package'}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Package Name"
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
              label="Price ($)"
              type="number"
              fullWidth
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              required
            />
            <TextField
              label="Number of Classes"
              type="number"
              fullWidth
              value={formData.numberOfClasses}
              onChange={(e) => setFormData({ ...formData, numberOfClasses: e.target.value })}
              InputProps={{ inputProps: { min: 1 } }}
              helperText="Use 999 for unlimited"
              required
            />
            <TextField
              label="Validity (Days)"
              type="number"
              fullWidth
              value={formData.validityDays}
              onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
              InputProps={{ inputProps: { min: 1 } }}
              required
            />
            {/* Classes Multi-Select */}
            <FormControl fullWidth>
              <InputLabel id="classes-select-label">Applicable Classes (Optional)</InputLabel>
              <Select
                labelId="classes-select-label"
                id="classes-select"
                multiple
                value={formData.classIds}
                onChange={(e) => setFormData({ ...formData, classIds: e.target.value as string[] })}
                input={<OutlinedInput label="Applicable Classes (Optional)" />}
                renderValue={(selected) => {
                  if (selected.length === 0) return 'All classes';
                  return selected
                    .map((id) => classes.find((c) => c.id === id)?.name)
                    .filter(Boolean)
                    .join(', ');
                }}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                {classes.length === 0 ? (
                  <MenuItem disabled>No classes available. Create classes first.</MenuItem>
                ) : (
                  classes.map((classItem) => (
                    <MenuItem key={classItem.id} value={classItem.id}>
                      {classItem.name}
                    </MenuItem>
                  ))
                )}
              </Select>
              {formData.classIds.length === 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Leave empty to apply to all classes
                </Typography>
              )}
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSavePackage}
            variant="contained"
            disabled={!formData.name || !formData.price || !formData.numberOfClasses || !formData.validityDays}
          >
            {editingPackage ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

