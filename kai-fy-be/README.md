# Kai-fy Complete Setup Guide

## Prerequisites

- Bun installed on your machine
- Spotify Premium account
- KaiOS Simulator downloaded
- (Optional) KaiOS device for real testing

---

## Part 1: Backend Setup

### 1.1 Create Backend Project

```bash
mkdir rpi-spotify-backend
cd rpi-spotify-backend
```

### 1.2 Install Dependencies

```bash
bun init -y
bun add hono
bun add -d @types/bun
```

### 1.3 Create Files

**package.json:**

```json
{
  "name": "rpi-spotify-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "bun run --watch server.ts",
    "start": "bun run server.ts"
  },
  "dependencies": {
    "hono": "^4.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest"
  }
}
```

Copy `server.ts` from the artifact above.

### 1.4 Get Spotify Credentials

1. Go to https://developer.spotify.com/dashboard
2. Click "Create app"
3. Fill in:
   - **App name:** Kai-fy Controller
   - **App description:** KaiOS Spotify Remote
   - **Redirect URI:** `http://localhost:3000/callback`
   - **API:** Check "Web API"
4. Click "Save"
5. Copy your **Client ID** and **Client Secret**

### 1.5 Create .env File

```bash
# .env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://localhost:3000/callback
```

### 1.6 Start Backend

```bash
bun run dev
```

You should see:

```
✅ Loaded saved tokens - authentication not needed!
(or nothing if first run)
🚀 Server running on http://localhost:3000
📱 To authenticate, visit: http://localhost:3000/auth
```

### 1.7 Authenticate (One Time Only)

1. Open browser: `http://localhost:3000/auth`
2. Login to Spotify
3. Click "Agree"
4. You'll see: "✅ Authentication successful! Tokens have been saved."

**Done!** A file `spotify-tokens.json` is created. Tokens persist forever.

---

## Part 2: KaiOS App Setup

### 2.1 Update Spotify Service

Replace your `kai-fy/src/services/spotify.ts` with the simplified version from the artifact above.

**Important:** Update this line with your computer's IP:

```typescript
const localIP = "192.168.1.100"; // Change to YOUR IP
```

Find your IP:

- **Mac/Linux:** `ifconfig | grep inet`
- **Windows:** `ipconfig`

### 2.2 Build the App

```bash
cd kai-fy
bun install
bun run build
```

Output will be in `kai-fy/dist/`

---

## Part 3: Testing in Simulator

### 3.1 Start Backend

```bash
cd rpi-spotify-backend
bun run dev
```

### 3.2 Start Spotify Desktop

Open Spotify app on your computer and play any song.

### 3.3 Open KaiOS Simulator

1. Launch KaiOS Simulator (kaiosrt)
2. Click "New App..." → Choose template (or skip)
3. Click folder icon → Select `kai-fy/dist` folder
4. Click "Install and run" (play button)

### 3.4 Test Controls

- **Left softkey** or **←** → Previous track
- **Center softkey** or **Enter** → Play/Pause
- **Right softkey** or **→** → Next track

You should see current track info updating every 5 seconds.

---

## Part 4: Testing on Real Device

### 4.1 Update Backend for Network Access

**.env:**

```bash
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
REDIRECT_URI=http://192.168.1.100:3000/callback  # Your IP
```

Restart backend:

```bash
bun run dev
```

### 4.2 Re-authenticate (If Needed)

If you changed the redirect URI, re-authenticate:

```
http://192.168.1.100:3000/auth
```

### 4.3 Update KaiOS App

In `kai-fy/src/services/spotify.ts`:

```typescript
const localIP = "192.168.1.100"; // Your actual IP
```

Rebuild:

```bash
bun run build
```

### 4.4 Install on Device

**Option A: WebIDE (Firefox)**

1. Install Firefox
2. Enable remote debugging on KaiOS device
3. Tools → Web Developer → WebIDE
4. Connect device
5. Open Packaged App → Select `kai-fy/dist`
6. Click "Install and Run"

**Option B: ADB**

```bash
adb install kai-fy/dist/application.zip
```

---

## Part 5: Production (RPi + External Access)

### 5.1 Move Backend to RPi

```bash
# On RPi
git clone your-repo
cd rpi-spotify-backend
bun install
bun run start
```

### 5.2 Setup Cloudflare Tunnel (Optional)

For access outside your home network:

```bash
# On RPi
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 -o cloudflared
chmod +x cloudflared
./cloudflared tunnel login
./cloudflared tunnel create kai-fy
./cloudflared tunnel route dns kai-fy spotify.yourdomain.com
```

**config.yml:**

```yaml
tunnel: <tunnel-id>
credentials-file: /path/to/credentials.json

ingress:
  - hostname: spotify.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

Run tunnel:

```bash
./cloudflared tunnel run kai-fy
```

### 5.3 Update KaiOS App for Production

```typescript
// src/services/spotify.ts
constructor() {
  this.baseUrl = 'https://spotify.yourdomain.com/api';
}
```

Rebuild and reinstall on KaiOS device.

---

## Troubleshooting

### "No track playing"

- ✅ Backend running?
- ✅ Authenticated? Check `spotify-tokens.json` exists
- ✅ Spotify playing? Open Spotify and play something
- ✅ Network? Try `curl http://localhost:3000/api/current-track`

### "Failed to fetch"

- ✅ Check KaiOS app console for errors
- ✅ Verify baseUrl in spotify.ts matches backend
- ✅ Check backend logs for requests

### "401 Unauthorized"

- ✅ Delete `spotify-tokens.json`
- ✅ Re-authenticate: `http://localhost:3000/auth`

### Can't reach from real device

- ✅ Same WiFi network?
- ✅ Firewall blocking port 3000?
- ✅ IP address correct in app?

---

## File Structure

```
rpi-spotify-backend/
├── server.ts
├── package.json
├── .env
└── spotify-tokens.json  (auto-generated)

kai-fy/
├── src/
│   ├── services/
│   │   └── spotify.ts  (updated)
│   └── ...
├── dist/  (build output)
└── package.json
```

---

## Next Steps

1. **Enhanced UI:** Add progress bar, volume control
2. **Playlist browsing:** Add endpoints for playlists
3. **Search:** Add search functionality
4. **Multiple accounts:** Support switching users
5. **Settings page:** Configure server URL from app

Enjoy controlling Spotify from your KaiOS phone! 🎵
