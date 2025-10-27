# Studio Owners - DanceUp App

A modern Next.js application for dance studio owners, built with Material UI and matching the DanceUp color scheme.

## Tech Stack

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Material UI v7** - React component library
- **Emotion** - CSS-in-JS library used by Material UI

## Color Scheme

The app uses a blue-purple gradient theme matching the DanceUp brand:
- Primary: `#2563eb` (blue-600)
- Secondary: `#9333ea` (purple-600)
- Background: Gradient from `#eff6ff` (blue-50) to `#f3e8ff` (purple-50)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

Dependencies have already been installed. To reinstall manually:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

Create a production build:

```bash
npm run build
```

### Production Server

Run the production server:

```bash
npm start
```

## Project Structure

```
studio-owners/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx      # Root layout with theme
│   │   ├── page.tsx          # Home page
│   │   └── globals.css       # Global styles
│   ├── components/           # React components
│   │   └── ThemeProvider.tsx # Material UI theme provider
│   └── lib/                  # Utilities
│       └── theme.ts          # Material UI theme configuration
├── public/                   # Static files
└── package.json              # Dependencies and scripts
```

## Features

- Material UI theme matching DanceUp brand colors
- Responsive design using CSS Grid and Material UI's layout system
- Modern App Router architecture
- Server and Client components
- Fast Refresh for instant updates

## Customization

### Theme

Edit the theme in `src/lib/theme.ts`:

```typescript
export const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb', // Your primary color
    },
    secondary: {
      main: '#9333ea', // Your secondary color
    },
  },
})
```

### Adding Components

Material UI components can be imported and used:

```typescript
import { Button, Card } from '@mui/material'
```

## Firebase Deployment

### Option 1: Firebase Hosting (Recommended)

For static Next.js exports:

1. Update `next.config.ts`:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
}
```

2. Build and deploy:
```bash
npm run build
firebase deploy --only hosting
```

### Option 2: Next.js on Firebase

For dynamic Next.js features:

1. Install dependencies:
```bash
npm install --save-dev firebase-tools
```

2. Initialize Firebase:
```bash
firebase init
```

3. Deploy:
```bash
npm run build
firebase deploy
```

## License

Private project for studio owners application.
