# Kai Radio - Audio Streaming System

Stream your machine's audio output over the local network and internet using Icecast and FFmpeg.

## Features

- ✅ Stream system audio in real-time
- ✅ MP3 encoding at 128kbps (configurable)
- ✅ Access via local network or internet
- ✅ Web-based listener interface
- ✅ Support for multiple simultaneous listeners
- ✅ Systemd service for automatic startup

## Architecture

- **Icecast2**: Streaming media server that distributes audio to listeners
- **FFmpeg**: Captures system audio via PulseAudio and encodes it for streaming
- **PulseAudio**: Provides audio device monitoring

## Quick Start

### 1. Installation

Run the setup script with sudo:

```bash
sudo ./setup.sh
```

This will:
- Install Icecast2, FFmpeg, and PulseAudio utilities
- Configure Icecast with the provided config
- Make scripts executable
- Install systemd services

### 2. Start Icecast Server

```bash
sudo systemctl start icecast2
sudo systemctl enable icecast2  # Optional: start on boot
```

### 3. Start Audio Streaming

**Option A: Manual (for testing)**
```bash
./stream-audio.sh
```

**Option B: As a service (automatic)**
```bash
sudo systemctl start kai-radio-stream
sudo systemctl enable kai-radio-stream  # Start on boot
```

### 4. Access the Stream

- **Web Interface**: http://localhost:8000
- **Stream URL**: http://localhost:8000/stream
- **Admin**: http://localhost:8000/admin (user: admin, password: hackme)

## Local Network Access

To access from other devices on your network:

1. Find your machine's IP address:
   ```bash
   ip addr show | grep "inet " | grep -v 127.0.0.1
   ```

2. Access the stream from other devices:
   ```
   http://YOUR_IP:8000/stream
   ```

3. Open firewall port (if needed):
   ```bash
   sudo ufw allow 8000/tcp
   ```

## Internet Access

### Option 1: Port Forwarding (Direct)

1. Configure your router to forward port 8000 to your machine
2. Find your public IP: `curl ifconfig.me`
3. Access via: `http://YOUR_PUBLIC_IP:8000/stream`

**Security Note**: Change default passwords in `/etc/icecast2/icecast.xml` before exposing to internet!

### Option 2: Reverse Proxy with Nginx (Recommended)

More secure option with HTTPS support:

1. Install Nginx:
   ```bash
   sudo apt-get install nginx certbot python3-certbot-nginx
   ```

2. Configure Nginx (`/etc/nginx/sites-available/kai-radio`):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_buffering off;
       }
   }
   ```

3. Enable and get SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/kai-radio /etc/nginx/sites-enabled/
   sudo certbot --nginx -d yourdomain.com
   sudo systemctl restart nginx
   ```

### Option 3: Cloudflare Tunnel (No Port Forwarding)

For cases where you can't configure port forwarding:

1. Install cloudflared:
   ```bash
   wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
   sudo dpkg -i cloudflared-linux-amd64.deb
   ```

2. Authenticate and create tunnel:
   ```bash
   cloudflared tunnel login
   cloudflared tunnel create kai-radio
   ```

3. Configure and run:
   ```bash
   cloudflared tunnel route dns kai-radio radio.yourdomain.com
   cloudflared tunnel run kai-radio --url http://localhost:8000
   ```

## Configuration

### Audio Settings

Edit `stream-audio.sh` to customize:

- `BITRATE`: Audio quality (default: 128k)
- `SAMPLE_RATE`: Sample rate in Hz (default: 44100)
- `CHANNELS`: Stereo (2) or Mono (1)

### Server Settings

Edit `/etc/icecast2/icecast.xml`:

- **Passwords**: Lines 16-19 (CHANGE THESE!)
- **Port**: Line 25 (default: 8000)
- **Max clients**: Line 5 (default: 100)
- **Hostname**: Line 22 (change for internet access)

After editing, restart Icecast:
```bash
sudo systemctl restart icecast2
```

## Troubleshooting

### No audio device found

Check available audio sources:
```bash
pactl list short sources
```

If no monitor device exists, ensure PulseAudio is running:
```bash
pulseaudio --check || pulseaudio --start
```

### Cannot connect to stream

1. Check if Icecast is running:
   ```bash
   sudo systemctl status icecast2
   ```

2. Check if port 8000 is listening:
   ```bash
   sudo netstat -tlnp | grep 8000
   ```

3. Check logs:
   ```bash
   sudo tail -f /var/log/icecast2/error.log
   ```

### Stream is silent

Ensure audio is actually playing on your system. The stream captures whatever is being output by your default audio device.

### Permission denied

If running as systemd service, ensure the user in `kai-radio-stream.service` matches your username and has access to PulseAudio.

## Listening to the Stream

### Web Browser
Just open: `http://YOUR_IP:8000/stream`

### Media Players

**VLC**:
```bash
vlc http://YOUR_IP:8000/stream
```

**mpv**:
```bash
mpv http://YOUR_IP:8000/stream
```

**On mobile**: Use any podcast/radio app that supports custom stream URLs

## Advanced Usage

### Multiple Stream Qualities

You can run multiple FFmpeg instances streaming to different mount points:

1. Add another `<mount>` section in `icecast.xml` with `/stream-hq`
2. Create a second script with higher bitrate (e.g., 320k)
3. Stream to different mount point

### Recording Stream

Record the stream to a file:
```bash
ffmpeg -i http://localhost:8000/stream -c copy output.mp3
```

### Stream Metadata

Update the stream title/description:
```bash
# Install ices2 or use Icecast admin API
curl -u admin:hackme -X POST \
  "http://localhost:8000/admin/metadata?mount=/stream&mode=updinfo&song=Now%20Playing:%20Your%20Song"
```

## Security Checklist

- [ ] Change default passwords in `icecast.xml`
- [ ] Use HTTPS/reverse proxy for internet access
- [ ] Configure firewall rules
- [ ] Limit max-listeners if bandwidth is a concern
- [ ] Monitor server logs regularly

## License

MIT - Feel free to modify and use as needed.

## Credits

Built with Icecast2 and FFmpeg on Ubuntu Linux.
