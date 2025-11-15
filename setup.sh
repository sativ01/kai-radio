#!/bin/bash

set -e

echo "==================================="
echo "Kai Radio - Audio Streaming Setup"
echo "==================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Update package list
echo "[1/5] Updating package list..."
apt-get update -qq

# Install dependencies
echo "[2/5] Installing dependencies..."
apt-get install -y icecast2 ffmpeg pulseaudio-utils

# Configure Icecast
echo "[3/5] Configuring Icecast..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cp "$SCRIPT_DIR/icecast.xml" /etc/icecast2/icecast.xml

# Enable Icecast to start
sed -i 's/ENABLE=false/ENABLE=true/' /etc/default/icecast2 2>/dev/null || true

# Make streaming script executable
echo "[4/5] Setting up streaming script..."
chmod +x "$SCRIPT_DIR/stream-audio.sh"

# Copy systemd service files
echo "[5/5] Installing systemd services..."
if [ -f "$SCRIPT_DIR/kai-radio-stream.service" ]; then
    cp "$SCRIPT_DIR/kai-radio-stream.service" /etc/systemd/system/
    systemctl daemon-reload
fi

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "Next steps:"
echo "1. Edit /etc/icecast2/icecast.xml to change default passwords"
echo "2. Start Icecast: sudo systemctl start icecast2"
echo "3. Start streaming: ./stream-audio.sh"
echo ""
echo "Web interface: http://localhost:8000"
echo "Stream URL: http://localhost:8000/stream"
echo ""
echo "For internet access, configure port forwarding on port 8000"
echo "or use a reverse proxy (see README.md)"
