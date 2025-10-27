# Studio Owners

A modern React application built with Vite, TypeScript, and Material UI.

## Tech Stack

- **Vite** - Fast build tool and dev server
- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Material UI** - React component library
- **Emotion** - CSS-in-JS library used by Material UI

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

The project has already been set up with all necessary dependencies. To install them manually (if needed):

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the next available port).

### Build

Create a production build:

```bash
npm run build
```

The build output will be in the `dist` directory.

### Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
studio-owners/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   ├── index.css        # Global styles
│   └── assets/          # Static assets
├── public/              # Public static files
├── dist/                # Build output (generated)
└── package.json         # Project dependencies and scripts
```

## Features

The application includes:

- Material UI theme with custom color palette
- Responsive design using CSS Grid
- AppBar with navigation
- Interactive components (Buttons, Cards, etc.)
- Sticky footer
- Modern, clean UI

## Customization

### Theme

Edit the theme in `src/main.tsx`:

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',  // Your primary color
    },
    secondary: {
      main: '#dc004e',  // Your secondary color
    },
  },
})
```

### Adding Components

Material UI components can be imported and used throughout the application:

```typescript
import { Button, Typography } from '@mui/material'
```

## License

Private project for studio owners application.
# dance-up-web-app-studio-owners
