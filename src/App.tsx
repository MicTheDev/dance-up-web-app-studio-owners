import { useState } from 'react'
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Paper,
  Stack,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import DanceIcon from '@mui/icons-material/MusicNote'

function App() {
  const [count, setCount] = useState(0)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <DanceIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Studio Owners
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Stack spacing={3}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom>
              Welcome to Studio Owners
            </Typography>
            <Typography variant="h6" color="text.secondary" paragraph>
              Built with Vite, React, TypeScript, and Material UI
            </Typography>
          </Paper>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Feature 1
                </Typography>
                <Typography color="text.secondary">
                  Manage your studio with ease
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Feature 2
                </Typography>
                <Typography color="text.secondary">
                  Track classes and schedules
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom>
                  Feature 3
                </Typography>
                <Typography color="text.secondary">
                  Connect with students
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Paper sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Interactive Counter
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCount((count) => count + 1)}
                sx={{ mt: 2 }}
              >
                Count is {count}
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Edit <code>src/App.tsx</code> and save to test HMR
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Container>

      <Box component="footer" sx={{ bgcolor: 'primary.main', color: 'white', py: 2, mt: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="body2" align="center">
            Studio Owners App © {new Date().getFullYear()}
          </Typography>
        </Container>
      </Box>
    </Box>
  )
}

export default App
