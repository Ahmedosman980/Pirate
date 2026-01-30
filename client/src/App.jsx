import { useState } from 'react';
import './index.css';

// Set this to your public backend URL (e.g., from localtunnel or ngrok)
// For local testing, keep it as 'http://localhost:5000'
const API_URL = 'https://pirate-loot-backend.onrender.com';

function App() {
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [videoInfo, setVideoInfo] = useState(null);
    const [error, setError] = useState('');

    const handleFetch = async () => {
        if (!url) return;
        setLoading(true);
        setError('');
        setVideoInfo(null);

        try {
            const response = await fetch(`${API_URL}/api/fetch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.details || data.error);

            setVideoInfo(data);
        } catch (err) {
            const msg = err.message || 'Something went wrong. Pirate ship hit a rock!';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (formatId, ext) => {
        const downloadUrl = `${API_URL}/api/download?url=${encodeURIComponent(url)}&format_id=${formatId}&title=${encodeURIComponent(videoInfo.title)}&ext=${ext}`;
        window.location.href = downloadUrl;
    };

    return (
        <div className="app-container">
            <header className="hero">
                <h1 className="logo">PIRATE</h1>
                <p className="motto">Loot your favorite media from across the seven seas</p>
            </header>

            <main className="main-card">
                <div className="input-group">
                    <input
                        type="text"
                        placeholder="Paste your link here (YouTube, TikTok, Instagram...)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleFetch()}
                    />
                    <button className="pirate-btn" onClick={handleFetch} disabled={loading}>
                        {loading ? <span className="loader"></span> : 'LOOT IT'}
                    </button>
                </div>

                <div className="supported-platforms">
                    <span className="ports-label">Supported Ports:</span>
                    <div className="platform-icons">
                        <div className="platform-item" title="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        </div>
                        <div className="platform-item" title="TikTok">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.74-3.94-1.69-.37-.31-.7-.65-.99-1.02a10.02 10.02 0 0 1-.09 3.82c-.15 1.51-.7 3.03-1.67 4.22-1.28 1.59-3.23 2.62-5.18 2.82-2.31.23-4.8-.46-6.49-2.12-1.84-1.81-2.58-4.6-2.1-7.05.35-1.78 1.41-3.41 2.94-4.38a8.03 8.03 0 0 1 7.15-.65V8.12a4.01 4.01 0 0 0-3.32 1.39 4.02 4.02 0 0 0-.25 4.79c.7 1.1 2.05 1.73 3.32 1.5.82-.12 1.59-.6 2.05-1.3.56-.86.72-1.92.59-2.94a15.82 15.82 0 0 0-.02-8.31c.42.01.85-.01 1.27-.01Z" /></svg>
                        </div>
                        <div className="platform-item" title="Instagram">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 1.764.319 2.158.674a2.72 2.72 0 0 1 .674 2.158c.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.319 1.764-.674 2.158a2.72 2.72 0 0 1-2.158.674c-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-1.764-.319-2.158-.674a2.72 2.72 0 0 1-.674-2.158c-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.319-1.764.674-2.158a2.72 2.72 0 0 1 2.158-.674c1.266-.058 1.646-.07 4.85-.07M12 0C8.741 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.741 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.986 8.741 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z" /></svg>
                        </div>
                        <div className="platform-item" title="Twitter/X">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" /></svg>
                        </div>
                        <div className="platform-item" title="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        </div>
                    </div>
                </div>

                {error && <p style={{ color: '#ff4b2b', textAlign: 'center', marginBottom: '1rem' }}>{error}</p>}

                {videoInfo && (
                    <div className="video-info">
                        <div className="thumbnail-container">
                            <img
                                src={`${API_URL}/api/proxy?url=${encodeURIComponent(videoInfo.thumbnail)}`}
                                alt={videoInfo.title}
                                onError={(e) => e.target.src = videoInfo.thumbnail} // Fallback to direct URL if proxy fails
                            />
                        </div>
                        <div className="metadata">
                            <h2>{videoInfo.title}</h2>
                            <span className="uploader">By {videoInfo.uploader} • {videoInfo.duration}</span>

                            <div className="format-list">
                                {videoInfo.formats.map((f, i) => (
                                    <div key={i} className={`format-item type-${f.type.toLowerCase().replace(/ /g, '-')}`}>
                                        <div className="format-details">
                                            <span className="format-type">{f.type}</span>
                                            <span className="format-ext">{f.extension}</span>
                                            <span className="format-res">{f.resolution} {f.note && `(${f.note})`}</span>
                                        </div>
                                        <button
                                            className="download-icon-btn"
                                            onClick={() => handleDownload(f.format_id, f.extension)}
                                            title="Download"
                                        >
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4"></path>
                                                <polyline points="7 10 12 15 17 10"></polyline>
                                                <line x1="12" y1="15" x2="12" y2="3"></line>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;
