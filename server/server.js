const express = require('express');
const cors = require('cors');
const path = require('path');
const { create: createYoutubeDl } = require('yt-dlp-exec');
const fs = require('fs');
require('dotenv').config();
const axios = require('axios'); // Moved axios require to the top

const app = express();
const PORT = process.env.PORT || 5000;
const isWindows = process.platform === 'win32';

const ytDlpPath = isWindows
    ? path.join(__dirname, 'yt-dlp.exe')
    : path.join(__dirname, 'yt-dlp');

const cookiePath = path.join(__dirname, 'cookies.txt');
const altCookiePath = path.join(process.cwd(), 'cookies.txt');
const rootCookiePath = path.join(process.cwd(), '..', 'cookies.txt');

const youtubeDl = (url, options) => {
    const finalOptions = { ...options };
    let actualCookiePath = null;

    console.log(`[DEBUG] __dirname: ${__dirname}`);
    console.log(`[DEBUG] process.cwd(): ${process.cwd()}`);

    try {
        const files = fs.readdirSync(process.cwd());
        console.log(`[DEBUG] Files in cwd: ${files.join(', ')}`);
        const parentFiles = fs.readdirSync(path.join(process.cwd(), '..'));
        console.log(`[DEBUG] Files in parent: ${parentFiles.join(', ')}`);
    } catch (e) {
        console.log(`[DEBUG] Could not list files: ${e.message}`);
    }

    if (fs.existsSync(cookiePath)) {
        actualCookiePath = cookiePath;
    } else if (fs.existsSync(altCookiePath)) {
        actualCookiePath = altCookiePath;
    } else if (fs.existsSync(rootCookiePath)) {
        actualCookiePath = rootCookiePath;
    }

    if (actualCookiePath) {
        console.log(`[SERVER] Cookies file detected at: ${actualCookiePath}`);
        finalOptions.cookies = actualCookiePath;
    } else {
        console.log('[SERVER] No cookies.txt found. Check your Render Secret File settings.');
    }

    return createYoutubeDl(ytDlpPath)(url, finalOptions);
};

app.use(cors());
app.use(express.json());

// API: Health check for Render.com
app.get('/api/health', (req, res) => {
    res.json({ status: 'sailing', platform: process.platform });
});

// API: Fetch video metadata
app.post('/api/fetch', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const metadata = await youtubeDl(url, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            preferFreeFormats: true,
            noCacheDir: true,
            geoBypass: true,
            forceIpv4: true,
            addHeader: [
                'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language: en-US,en;q=0.9',
                'Origin: https://www.youtube.com',
                'Referer: https://www.youtube.com/'
            ],
            // YouTube is very aggressive. We use the most resilient clients.
            extractorArgs: 'youtube:player_client=ios,android'
        });

        // Expanded format parsing for all options
        const formats = (metadata.formats || [])
            .map(f => {
                let type = 'Video + Audio';
                if (f.vcodec !== 'none' && f.acodec === 'none') type = 'Video Only';
                if (f.vcodec === 'none' && f.acodec !== 'none') type = 'Audio Only';

                return {
                    format_id: f.format_id,
                    extension: f.ext,
                    resolution: f.resolution || (f.height ? `${f.height}p` : (f.vcodec !== 'none' ? 'Video' : 'Audio')),
                    filesize: f.filesize || f.filesize_approx || 0,
                    note: f.format_note || f.quality || '',
                    type: type
                };
            })
            .filter(f => f.format_id)
            .sort((a, b) => {
                // Priority: Combined > Video Only > Audio Only
                const priority = { 'Video + Audio': 3, 'Video Only': 2, 'Audio Only': 1 };
                if (priority[b.type] !== priority[a.type]) return priority[b.type] - priority[a.type];
                return (b.filesize || 0) - (a.filesize || 0);
            });

        res.json({
            title: metadata.title || 'Untitled Loot',
            thumbnail: metadata.thumbnail,
            duration: metadata.duration_string || 'N/A',
            uploader: metadata.uploader || metadata.extractor || 'Unknown',
            formats: formats.slice(0, 20) // Show more options
        });
    } catch (error) {
        console.error('Fetch Error:', error);
        const detailedError = error.stderr || error.message || 'Unknown error';
        res.status(500).json({
            error: 'Pirate ship hit a hidden rock!',
            details: detailedError
        });
    }
});

// API: Thumbnail Proxy (to bypass hotlinking protection)
app.get('/api/proxy', async (req, res) => {
    const { url } = req.query;
    if (!url) return res.status(400).send('URL is required');

    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'stream',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                'Referer': 'https://www.instagram.com/'
            }
        });
        response.data.pipe(res);
    } catch (error) {
        console.error('Proxy Error:', error.message);
        res.status(500).send('Failed to proxy image');
    }
});

const { spawn } = require('child_process');

// API: Stream download
app.get('/api/download', async (req, res) => {
    const { url, format_id, title, ext } = req.query;

    if (!url || !format_id) {
        return res.status(400).send('Missing URL or format ID');
    }

    const fileName = `${title || 'video'}.${ext || 'mp4'}`;

    res.header('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    try {
        console.log(`[DOWNLOAD] Starting: ${url} (Format: ${format_id})`);

        // Use spawn directly for better control over the stream
        const args = [
            url,
            '--format', format_id,
            '--output', '-',
            '--no-check-certificates',
            '--no-warnings',
            '--no-cache-dir',
            '--add-header', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            '--extractor-args', 'youtube:player_client=ios,android'
        ];

        let actualCookiePath = null;
        if (fs.existsSync(cookiePath)) actualCookiePath = cookiePath;
        else if (fs.existsSync(altCookiePath)) actualCookiePath = altCookiePath;
        else if (fs.existsSync(rootCookiePath)) actualCookiePath = rootCookiePath;

        if (actualCookiePath) {
            console.log(`[DOWNLOAD] Using cookies from: ${actualCookiePath}`);
            args.push('--cookies', actualCookiePath);
        }

        const subprocess = spawn(ytDlpPath, args);

        subprocess.stdout.pipe(res);

        subprocess.stderr.on('data', (data) => {
            console.error(`[yt-dlp stderr]: ${data}`);
        });

        subprocess.on('error', (err) => {
            console.error('[spawn error]:', err);
            if (!res.headersSent) res.status(500).send('Error starting download');
        });

        subprocess.on('close', (code) => {
            console.log(`[DOWNLOAD] Subprocess closed with code ${code}`);
        });

        res.on('close', () => {
            console.log('[DOWNLOAD] Client closed connection, killing process');
            subprocess.kill();
        });

    } catch (error) {
        console.error('[DOWNLOAD CRITICAL]:', error);
        if (!res.headersSent) res.status(500).send('Download failed');
    }
});

app.listen(PORT, () => {
    console.log(`Pirate Server sailing on port ${PORT}`);
});
