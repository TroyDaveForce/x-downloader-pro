# x-downloader-pro

A simple, self-hosted web app for downloading videos from public Twitter/X posts. Paste a post link, get back the video in the available resolutions.

> **Note:** This is an original build with its own design and code, not a copy of any other site's source. It replicates the *functionality* commonly found in this category of tool.

## Project structure

```
x-downloader-pro/
├── package.json
├── .env.example
├── server/
│   ├── server.js          # Express app entry point
│   ├── routes/
│   │   └── download.js    # POST /api/fetch
│   └── utils/
│       └── twitter.js     # tweet ID parsing + video extraction
└── public/                # static frontend
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## Running it in VS Code

1. **Open the folder**: `File > Open Folder…` and select the `x-downloader-pro` folder.
2. **Open a terminal** in VS Code: `Terminal > New Terminal`.
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Copy the env file** (optional — defaults work fine):
   ```bash
   cp .env.example .env
   ```
5. **Run the dev server** (auto-restarts on file changes):
   ```bash
   npm run dev
   ```
   Or for a plain start:
   ```bash
   npm start
   ```
6. Open **http://localhost:3000** in your browser.

## How the video fetching works

`server/utils/twitter.js` extracts the numeric tweet/status ID from the pasted URL, then queries Twitter's public **syndication** endpoint (the same one that powers embedded-tweet widgets on other websites) to retrieve the tweet's media info, including the raw `.mp4` variant URLs and their bitrates. No API key or login is required for this endpoint, but keep in mind:

- It only works for **public** posts.
- Twitter/X can change or restrict this endpoint at any time without notice — if fetching stops working, that endpoint's behavior is the first place to check.
- For heavier/production use, you'd want to add rate limiting and caching.

## Legal note

This tool only works with content the poster made public, and downloading should respect the original creator's rights and Twitter/X's Terms of Service. Consider adding a clear "for personal use only" notice (already included in the footer) if you deploy this publicly.

## Customizing

- **Branding/colors**: edit the CSS variables at the top of `public/css/style.css`.
- **Copy/text**: edit `public/index.html` directly.
- **Port**: change `PORT` in `.env`.
