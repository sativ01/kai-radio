# Kai-fy - Spotify Controller for KaiOS

A modern KaiOS application for controlling Spotify playback on your phone, built with Vite, TypeScript, and Bun.

## Features

- ✅ View currently playing track
- ✅ Display song name, artist, and album
- ✅ Show album artwork
- ✅ Play/Pause/Stop controls
- ✅ Next/Previous track navigation
- ✅ KaiOS softkey and D-pad navigation support
- 🎯 Designed for KaiOS 240x320 screen size

## Tech Stack

- **Bun** - Fast JavaScript runtime and package manager
- **Vite** - Modern build tool with HMR
- **TypeScript** - Type-safe development
- **Pure HTML/CSS** - No framework dependencies
- **Spotify Web API** - Playback control

## Project Structure

```
kai-fy/
├── src/
│   ├── main.ts              # Application entry point
│   ├── app.ts               # App initialization & orchestration
│   ├── types/
│   │   └── spotify.ts       # TypeScript interfaces
│   ├── services/
│   │   ├── spotify.ts       # Spotify API controller
│   │   └── inputHandler.ts # KaiOS input handling
│   ├── ui/
│   │   └── uiManager.ts     # UI rendering and updates
│   └── styles/
│       └── main.css         # Application styles
├── index.html               # HTML entry point
├── manifest.webapp          # KaiOS manifest
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## Setup

### Prerequisites

- [Bun](https://bun.sh) installed
- Spotify Premium account (required for playback control)
- Spotify Developer account for API credentials

### Installation

1. Install dependencies:
```bash
bun install
```

2. Get Spotify API credentials:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note your Client ID and Client Secret
   - Add `http://localhost:3000` to Redirect URIs

3. Start development server:
```bash
bun run dev
```

4. Open http://localhost:3000 in your browser

### Building for Production

```bash
bun run build
```

The built files will be in the `dist/` directory.

## Spotify Authentication

You'll need to obtain a Spotify access token to use this app:

1. Use the [Spotify OAuth flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
2. Store the access token using the app's UI (feature to be implemented)
3. For development, you can manually set the token in browser console:
```javascript
localStorage.setItem('spotify_access_token', 'YOUR_TOKEN_HERE');
```

## KaiOS Deployment

1. Build the app for production
2. Package the `dist/` directory with `manifest.webapp`
3. Submit to KaiStore or sideload using WebIDE

## Controls

### Keyboard (Development)
- **←/→** - Previous/Next track
- **Enter** - Play/Pause toggle

### KaiOS Device
- **Left softkey** - Previous track
- **Center softkey** - Play/Pause
- **Right softkey** - Next track
- **D-pad left/right** - Previous/Next track
- **D-pad center** - Play/Pause

## Future Enhancements

- [ ] OAuth authentication flow
- [ ] Volume control (D-pad up/down)
- [ ] Playlist browsing
- [ ] Search functionality
- [ ] Queue management
- [ ] Offline mode
- [ ] Settings screen

## Development

### Type checking
```bash
bun run typecheck
```

### Preview production build
```bash
bun run preview
```

## License

MIT

## Contributing

Contributions are welcome! The codebase is designed to be modular and extensible.
