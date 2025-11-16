// server.ts - RPi Spotify Controller Backend
import { Hono } from "hono";
import { cors } from "hono/cors";
import { writeFileSync, readFileSync, existsSync } from "fs";

const app = new Hono();

// Configuration
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const REDIRECT_URI =
  process.env.REDIRECT_URI || "http://localhost:3000/callback";
const PORT = 3000;
const TOKEN_FILE = "./spotify-tokens.json";

// Token storage with persistence
let accessToken: string | null = null;
let refreshToken: string | null = null;
let tokenExpiry: number = 0;

// Load tokens on startup
if (existsSync(TOKEN_FILE)) {
  try {
    const saved = JSON.parse(readFileSync(TOKEN_FILE, "utf-8"));
    accessToken = saved.accessToken;
    refreshToken = saved.refreshToken;
    tokenExpiry = saved.tokenExpiry;
    console.log("✅ Loaded saved tokens - authentication not needed!");
  } catch (error) {
    console.error("Failed to load tokens:", error);
  }
}

// Save tokens to file
function saveTokens(): void {
  try {
    writeFileSync(
      TOKEN_FILE,
      JSON.stringify(
        {
          accessToken,
          refreshToken,
          tokenExpiry,
          savedAt: new Date().toISOString(),
        },
        null,
        2,
      ),
    );
    console.log("💾 Tokens saved to file");
  } catch (error) {
    console.error("Failed to save tokens:", error);
  }
}

// Enable CORS for KaiOS app
app.use("/*", cors());

// Health check
app.get("/", (c) => {
  return c.json({
    status: "ok",
    authenticated: !!accessToken,
    tokenExpiry:
      tokenExpiry > Date.now()
        ? new Date(tokenExpiry).toISOString()
        : "expired",
  });
});

// OAuth - Step 1: Redirect to Spotify auth
app.get("/auth", (c) => {
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "user-read-currently-playing",
  ].join(" ");

  const authUrl = new URL("https://accounts.spotify.com/authorize");
  authUrl.searchParams.append("client_id", SPOTIFY_CLIENT_ID);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", REDIRECT_URI);
  authUrl.searchParams.append("scope", scopes);

  return c.redirect(authUrl.toString());
});

// OAuth - Step 2: Handle callback and exchange code for token
app.get("/callback", async (c) => {
  const code = c.req.query("code");

  if (!code) {
    return c.text("Error: No authorization code received", 400);
  }

  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      accessToken = data.access_token;
      refreshToken = data.refresh_token;
      tokenExpiry = Date.now() + data.expires_in * 1000;

      return c.html(`
        <h1>✅ Authentication successful!</h1>
        <p>You can now use the KaiOS app to control Spotify.</p>
        <p><a href="/">Back to home</a></p>
      `);
    } else {
      throw new Error("No access token received");
    }
  } catch (error) {
    console.error("Auth error:", error);
    return c.text("Authentication failed", 500);
  }
});

// Token refresh middleware
async function ensureValidToken() {
  if (!accessToken || Date.now() >= tokenExpiry - 60000) {
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`),
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + data.expires_in * 1000;
  }
}

// API Routes

// Get current track
app.get("/api/current-track", async (c) => {
  try {
    await ensureValidToken();

    const response = await fetch(
      "https://api.spotify.com/v1/me/player/currently-playing",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (response.status === 204) {
      return c.json(null);
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();

    return c.json({
      id: data.item.id,
      name: data.item.name,
      artist: data.item.artists.map((a: any) => a.name).join(", "),
      album: data.item.album.name,
      albumArt: data.item.album.images[0]?.url,
      duration: data.item.duration_ms,
      position: data.progress_ms,
      isPlaying: data.is_playing,
    });
  } catch (error) {
    console.error("Error fetching current track:", error);
    return c.json({ error: "Failed to fetch current track" }, 500);
  }
});

// Play
app.post("/api/play", async (c) => {
  try {
    await ensureValidToken();

    await fetch("https://api.spotify.com/v1/me/player/play", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error playing:", error);
    return c.json({ error: "Failed to play" }, 500);
  }
});

// Pause
app.post("/api/pause", async (c) => {
  try {
    await ensureValidToken();

    await fetch("https://api.spotify.com/v1/me/player/pause", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error pausing:", error);
    return c.json({ error: "Failed to pause" }, 500);
  }
});

// Next track
app.post("/api/next", async (c) => {
  try {
    await ensureValidToken();

    await fetch("https://api.spotify.com/v1/me/player/next", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error skipping to next:", error);
    return c.json({ error: "Failed to skip" }, 500);
  }
});

// Previous track
app.post("/api/previous", async (c) => {
  try {
    await ensureValidToken();

    await fetch("https://api.spotify.com/v1/me/player/previous", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return c.json({ success: true });
  } catch (error) {
    console.error("Error going to previous:", error);
    return c.json({ error: "Failed to go back" }, 500);
  }
});

// Toggle play/pause
app.post("/api/toggle", async (c) => {
  try {
    await ensureValidToken();

    // Get current state
    const stateResponse = await fetch("https://api.spotify.com/v1/me/player", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (stateResponse.status === 204) {
      return c.json({ error: "No active device" }, 404);
    }

    const state = await stateResponse.json();
    const isPlaying = state.is_playing;

    // Toggle
    const endpoint = isPlaying ? "pause" : "play";
    await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return c.json({ success: true, isPlaying: !isPlaying });
  } catch (error) {
    console.error("Error toggling playback:", error);
    return c.json({ error: "Failed to toggle" }, 500);
  }
});

console.log(`🚀 Server running on http://localhost:${PORT}`);
console.log(`📱 To authenticate, visit: http://localhost:${PORT}/auth`);

export default {
  port: PORT,
  fetch: app.fetch,
};
