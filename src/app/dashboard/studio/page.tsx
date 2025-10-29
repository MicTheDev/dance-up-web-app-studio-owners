'use client';

import { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Grid,
  Stack,
  Divider,
  Avatar,
  MenuItem,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// US States array
const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
];

interface StudioData {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  studioName: string;
  studioImageURL?: string;
  website?: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
  };
  accessLevel: string;
  createdAt?: any;
  updatedAt?: any;
}

export default function StudioPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [studioData, setStudioData] = useState<StudioData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zipCode: '',
    studioName: '',
    website: '',
    facebook: '',
    instagram: '',
    tiktok: '',
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Fetch studio data
  useEffect(() => {
    const fetchStudioData = async () => {
      if (!user) return;

      try {
        const docRef = doc(db, 'studioOwners', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data() as StudioData;
          setStudioData(data);
          setFormData({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            address1: data.address1 || '',
            address2: data.address2 || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            studioName: data.studioName || '',
            website: data.website || '',
            facebook: data.socialMedia?.facebook || '',
            instagram: data.socialMedia?.instagram || '',
            tiktok: data.socialMedia?.tiktok || '',
          });
          if (data.studioImageURL) {
            setImagePreview(data.studioImageURL);
          }
        } else {
          setError('Studio profile not found');
        }
      } catch (err) {
        console.error('Error fetching studio data:', err);
        setError('Failed to load studio data');
      } finally {
        setLoadingData(false);
      }
    };

    fetchStudioData();
  }, [user]);

  if (loading || loadingData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user || !studioData) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      setNewImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original studio data
    if (studioData) {
      setFormData({
        firstName: studioData.firstName || '',
        lastName: studioData.lastName || '',
        address1: studioData.address1 || '',
        address2: studioData.address2 || '',
        city: studioData.city || '',
        state: studioData.state || '',
        zipCode: studioData.zipCode || '',
        studioName: studioData.studioName || '',
        website: studioData.website || '',
        facebook: studioData.socialMedia?.facebook || '',
        instagram: studioData.socialMedia?.instagram || '',
        tiktok: studioData.socialMedia?.tiktok || '',
      });
      if (studioData.studioImageURL) {
        setImagePreview(studioData.studioImageURL);
      }
      setNewImage(null);
    }
  };

  const handleSave = async () => {
    if (!user || !studioData) return;

    setError('');
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.address1 || 
          !formData.city || !formData.state || !formData.zipCode || !formData.studioName) {
        setError('Please fill in all required fields');
        setSaving(false);
        return;
      }

      let studioImageURL = studioData.studioImageURL;

      // Upload new image if provided
      if (newImage && user) {
        try {
          // Delete old image if exists
          if (studioImageURL) {
            try {
              const oldImageRef = ref(storage, `studio-images/${user.uid}`);
              await deleteObject(oldImageRef);
            } catch (err) {
              console.log('No old image to delete or error deleting:', err);
            }
          }

          // Upload new image
          const storageRef = ref(storage, `studio-images/${user.uid}`);
          await uploadBytes(storageRef, newImage);
          studioImageURL = await getDownloadURL(storageRef);
        } catch (storageError) {
          console.error('Error uploading image:', storageError);
          setError('Failed to upload image');
          setSaving(false);
          return;
        }
      }

      // Update studio data
      const updatedData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        studioName: formData.studioName,
        website: formData.website || '',
        studioImageURL: studioImageURL,
        socialMedia: {
          facebook: formData.facebook || '',
          instagram: formData.instagram || '',
          tiktok: formData.tiktok || '',
        },
        updatedAt: serverTimestamp(),
      };

      // Update both collections
      const studioOwnerRef = doc(db, 'studioOwners', user.uid);
      await updateDoc(studioOwnerRef, updatedData);

      // Update users collection as well
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updatedData);

      setStudioData({ ...studioData, ...updatedData });
      setIsEditing(false);
      setNewImage(null);
      setSnackbarMessage('Studio information updated successfully!');
    } catch (err: any) {
      console.error('Error updating studio data:', err);
      setError(err.message || 'Failed to update studio information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Studio Profile
        </Typography>
        {!isEditing ? (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Studio Image */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card elevation={2}>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={imagePreview}
                  sx={{ width: 200, height: 200 }}
                  variant="rounded"
                >
                  {!imagePreview && <ImageIcon sx={{ fontSize: 80 }} />}
                </Avatar>
                {isEditing && (
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                    fullWidth
                    size="small"
                  >
                    {newImage ? 'Change Image' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      hidden
                    />
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Studio Information */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Studio Information
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Studio Name"
                  name="studioName"
                  value={formData.studioName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
                <TextField
                  label="Website"
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  placeholder="https://www.example.com"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Personal Information */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Personal Information
              </Typography>
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Email"
                  value={studioData.email}
                  disabled
                  fullWidth
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Address */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Address
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Address Line 1"
                  name="address1"
                  value={formData.address1}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  required
                />
                <TextField
                  label="Address Line 2 (Optional)"
                  name="address2"
                  value={formData.address2}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                />
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="City"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      select
                      label="State"
                      name="state"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData({ ...formData, state: e.target.value });
                      }}
                      disabled={!isEditing}
                      fullWidth
                      required
                    >
                      {US_STATES.map((state) => (
                        <MenuItem key={state.value} value={state.value}>
                          {state.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 3 }}>
                    <TextField
                      label="Zip Code"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      disabled={!isEditing}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Social Media */}
        <Grid size={{ xs: 12 }}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                Social Media
              </Typography>
              <Stack spacing={3}>
                <TextField
                  label="Facebook URL"
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  placeholder="https://www.facebook.com/yourpage"
                />
                <TextField
                  label="Instagram URL"
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  placeholder="https://www.instagram.com/yourhandle"
                />
                <TextField
                  label="TikTok URL"
                  type="url"
                  name="tiktok"
                  value={formData.tiktok}
                  onChange={handleChange}
                  disabled={!isEditing}
                  fullWidth
                  placeholder="https://www.tiktok.com/@yourhandle"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Snackbar for success message */}
      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
      />
    </Container>
  );
}
