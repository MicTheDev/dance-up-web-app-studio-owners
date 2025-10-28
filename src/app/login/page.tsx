'use client';

import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, storage, db } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Avatar,
  Divider,
  MenuItem,
  Stack,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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

export default function Login() {
  const [user, authLoading] = useAuthState(auth);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
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
    accessLevel: 'studio_owner',
  });
  const [studioImage, setStudioImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Redirect authenticated users
  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Don't render if user is authenticated
  if (user) {
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
      setStudioImage(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.address1 || 
          !formData.city || !formData.state || !formData.zipCode || !formData.studioName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate passwords
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        setLoading(false);
        return;
      }

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      let studioImageURL = '';

      // Upload studio image if provided
      if (studioImage) {
        try {
          const storageRef = ref(storage, `studio-images/${userCredential.user.uid}`);
          await uploadBytes(storageRef, studioImage);
          studioImageURL = await getDownloadURL(storageRef);
        } catch (storageError: any) {
          console.error('Error uploading image:', storageError);
          // Continue with registration even if image upload fails
        }
      }

      // Save user profile to Firestore
      const userData = {
        uid: userCredential.user.uid,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        address1: formData.address1,
        address2: formData.address2 || '',
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        studioName: formData.studioName,
        studioImageURL: studioImageURL,
        website: formData.website || '',
        socialMedia: {
          facebook: formData.facebook || '',
          instagram: formData.instagram || '',
          tiktok: formData.tiktok || '',
        },
        accessLevel: formData.accessLevel,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to both users and studioOwners collections
      await setDoc(doc(db, 'users', userCredential.user.uid), userData);
      await setDoc(doc(db, 'studioOwners', userCredential.user.uid), userData);

      // Redirect to dashboard after successful registration
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(to bottom right, #eff6ff, #f3e8ff)',
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
            {tabValue === 0 ? 'Welcome to Studio Owners' : 'Create Your Studio Account'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {tabValue === 0 
              ? 'Sign in to manage your dance studio' 
              : 'Join DanceUp and manage your dance studio'
            }
          </Typography>
        </Box>

        {/* Main Card */}
        <Paper elevation={3} sx={{ p: 4 }}>
          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs
              value={tabValue}
              onChange={(_, newValue) => {
                setTabValue(newValue);
                setError('');
              }}
              centered
            >
              <Tab label="Login" />
              <Tab label="Sign Up" />
            </Tabs>
          </Box>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Forms */}
          {tabValue === 0 ? (
            // Login Form
            <Box component="form" onSubmit={handleLogin}>
              <Stack spacing={3}>
                <TextField
                  label="Email Address"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                />
                <TextField
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                    py: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
                </Button>
              </Stack>
            </Box>
          ) : (
            // Sign Up Form
            <Box component="form" onSubmit={handleSignUp}>
              <Stack spacing={4}>
                {/* Studio Image Upload */}
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Studio Image (Optional)
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                    <Avatar
                      src={imagePreview}
                      sx={{ width: 128, height: 128 }}
                      variant="rounded"
                    >
                      <ImageIcon sx={{ fontSize: 64 }} />
                    </Avatar>
                    <Button
                      component="label"
                      variant="contained"
                      startIcon={<CloudUploadIcon />}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        hidden
                      />
                    </Button>
                  </Box>
                </Box>

                <Divider />

                {/* Personal Information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Personal Information
                  </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* Address */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Address
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Address Line 1"
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Address Line 2 (Optional)"
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                      <TextField
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                      />
                      <TextField
                        select
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                      >
                        {US_STATES.map((state) => (
                          <MenuItem key={state.value} value={state.value}>
                            {state.label}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        label="Zip Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                        fullWidth
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </Box>

                <Divider />

                {/* Studio Information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Studio Information
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Studio Name"
                      name="studioName"
                      value={formData.studioName}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Website (Optional)"
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.example.com"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* Social Media */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Social Media (Optional)
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Facebook URL"
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.facebook.com/yourpage"
                    />
                    <TextField
                      label="Instagram URL"
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.instagram.com/yourhandle"
                    />
                    <TextField
                      label="TikTok URL"
                      type="url"
                      name="tiktok"
                      value={formData.tiktok}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="https://www.tiktok.com/@yourhandle"
                    />
                  </Stack>
                </Box>

                <Divider />

                {/* Account Information */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Account Information
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="Email Address"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                    <TextField
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      helperText="At least 6 characters"
                    />
                    <TextField
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{
                    background: 'linear-gradient(45deg, #1976d2 30%, #9c27b0 90%)',
                    py: 1.5,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
                </Button>
              </Stack>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
