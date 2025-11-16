import { SpotifyController } from "./services/spotify";
import { UIManager } from "./ui/uiManager";
import { InputHandler } from "./services/inputHandler";

let spotifyController: SpotifyController;
let uiManager: UIManager;
let inputHandler: InputHandler;

export async function initializeApp(): Promise<void> {
  try {
    // Initialize services
    spotifyController = new SpotifyController();
    uiManager = new UIManager();
    inputHandler = new InputHandler();

    // Setup event listeners
    setupEventListeners();

    // Initialize UI
    await uiManager.initialize();

    // Start polling for current playback
    await updateNowPlaying();
    setInterval(updateNowPlaying, 5000); // Update every second

    console.log("App initialized successfully");
  } catch (error) {
    console.error("Failed to initialize app:", error);
  }
}

function setupEventListeners(): void {
  // Handle arrow keys (KaiOS device keys)
  inputHandler.on("up", () => {
    // Could be used for volume or other controls in future
  });

  inputHandler.on("down", () => {
    // Could be used for volume or other controls in future
  });

  inputHandler.on("left", () => {
    spotifyController.previousTrack();
  });

  inputHandler.on("right", () => {
    spotifyController.nextTrack();
  });

  inputHandler.on("enter", () => {
    spotifyController.togglePlayPause();
  });

  inputHandler.on("softkey-left", () => {
    spotifyController.previousTrack();
  });

  inputHandler.on("softkey-center", () => {
    spotifyController.togglePlayPause();
  });

  inputHandler.on("softkey-right", () => {
    spotifyController.nextTrack();
  });
}

async function updateNowPlaying(): Promise<void> {
  try {
    const track = await spotifyController.getCurrentTrack();
    if (track) {
      uiManager.updateNowPlaying(track);
    }
  } catch (error) {
    console.error("Failed to update now playing:", error);
  }
}

export { spotifyController, uiManager };
