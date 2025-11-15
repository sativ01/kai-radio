#!/bin/bash

# Audio Streaming Script
# Captures system audio output and streams to Icecast server

# Configuration
ICECAST_HOST="localhost"
ICECAST_PORT="8000"
ICECAST_PASSWORD="hackme"
MOUNT_POINT="stream"
STREAM_NAME="Kai Radio"
STREAM_DESCRIPTION="System Audio Stream"
STREAM_GENRE="Various"

# Audio settings
SAMPLE_RATE=44100
CHANNELS=2
BITRATE=128k

# Detect PulseAudio monitor device
MONITOR_DEVICE=$(pactl list short sources | grep -i "monitor" | head -n 1 | awk '{print $2}')

if [ -z "$MONITOR_DEVICE" ]; then
    echo "Error: No PulseAudio monitor device found."
    echo "Available sources:"
    pactl list short sources
    exit 1
fi

echo "Using audio source: $MONITOR_DEVICE"
echo "Streaming to: http://${ICECAST_HOST}:${ICECAST_PORT}/${MOUNT_POINT}"

# Stream using FFmpeg low-latency settings
ffmpeg -f pulse -i "$MONITOR_DEVICE" \
    -fflags nobuffer -flags low_delay \
    -acodec libmp3lame -ab $BITRATE -ar $SAMPLE_RATE -ac $CHANNELS \
    -content_type audio/mpeg \
    -ice_name "$STREAM_NAME" \
    -ice_description "$STREAM_DESCRIPTION" \
    -ice_genre "$STREAM_GENRE" \
    -f mp3 \
    icecast://source:${ICECAST_PASSWORD}@${ICECAST_HOST}:${ICECAST_PORT}/${MOUNT_POINT}
