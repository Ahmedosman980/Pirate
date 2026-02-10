# Pirate - Full-Stack Video Downloader 🏴‍☠️

Pirate is a powerful, full-stack web application designed to help users "loot" videos from various platforms. Built with a modern React frontend and a robust Node.js backend, it leverages `yt-dlp` to provide seamless metadata fetching and media streaming.

![Pirate Preview](https://via.placeholder.com/1200x600?text=Pirate+Project+Preview)

## ✨ Features

- **🚀 High-Speed Fetching:** Quickly retrieve video metadata, thumbnails, and available formats.
- **📥 Streamed Downloads:** Direct-to-browser streaming for downloads, bypassing the need for server-side storage.
- **🍪 Intelligent Cookie Handling:** Automatic conversion of JSON cookies to Netscape format to bypass platform restrictions.
- **📱 Responsive UI:** Built with React and Vite for a lightning-fast, mobile-ready experience.
- **🛠️ Multi-Format Support:** Choose between video+audio, video-only, or audio-only formats.
- **☁️ Cloud Ready:** Pre-configured for deployment on Firebase (hosting) and Render.com (API).

## 🛠️ Tech Stack

### Frontend
- **React 18:** Component-based UI.
- **Vite:** Next-generation frontend tooling.
- **Axios:** For API communication with the backend.

### Backend
- **Node.js & Express:** Scalable API server.
- **yt-dlp:** The industry standard for media downloading.
- **Axios:** Used for proxying and external requests.
- **Child Process (Spawn):** For real-time streaming of download data.

## 📂 Project Structure

```text
├── client/          # React frontend (Vite)
│   ├── src/         # UI components and logic
│   └── public/      # Static assets
├── server/          # Node.js Express API
│   ├── server.js    # Main server logic and yt-dlp integration
│   └── build.sh     # Deployment script
├── firebase.json    # Firebase Hosting configuration
└── .firebaserc      # Firebase project environment
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- `yt-dlp` installed on the server environment.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ahmedosman980/Pirate.git
   ```

2. **Setup Server:**
   ```bash
   cd server
   npm install
   # Create a .env file with your PORT
   npm start
   ```

3. **Setup Client:**
   ```bash
   cd client
   npm install
   npm run dev
   ```

## 🤝 Contributing

Sail with us! Contributions are welcome via Issues and Pull Requests.

---
*Developed by [Ahmedosman980](https://github.com/Ahmedosman980)*
