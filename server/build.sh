#!/usr/bin/env bash
# This script runs on Render.com during build

echo "Installing yt-dlp for Linux..."
curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o yt-dlp
chmod a+rx yt-dlp

echo "Installing node dependencies..."
npm install
