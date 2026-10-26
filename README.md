# EchoCast AI - Multilingual Dual-Host AI Podcast Generator 🎙️✨

An end-to-end AI podcast creation studio built for hackathons, powered by **Sarvam AI (Bulbul TTS)** and **Google Gemini 2.5 Flash**. 

Generate broadcast-grade, natural two-host conversational podcast episodes with real-time synchronized karaoke transcripts, custom procedural album artwork, and instant composite WAV download.

---

## 🌟 Key Features

1. **Intelligent Conversational Scripting (Gemini 2.5 Flash)**:
   - Dynamic banter between Host 1 (curious lead anchor) and Host 2 (sharp expert analyst).
   - Structured JSON schema generating catchy Episode Title, Tagline, Detailed Synopsis, Key Takeaways, Artwork Prompt, and timed Script turns.
   - Pacing options: 1-minute quick recap vs 3-minute deep dive vs 5-minute masterclass.

2. **Multilingual Indic Voice Synthesis (Sarvam AI Bulbul)**:
   - Full support for 10+ Indic languages: Indian English (`en-IN`), Hindi (`hi-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Bengali (`bn-IN`), Marathi (`mr-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), Gujarati (`gu-IN`), Punjabi (`pa-IN`).
   - Dual-host speaker pairing using Sarvam Bulbul voices (e.g. `shubh`, `aditya`, `amartya`, `arvind` for Host 1; `simran_en_customer`, `meera`, `pavithra`, `maitreyi` for Host 2).
   - Adjustable speaking pace (0.85x to 1.3x).

3. **Client-Side Audio Stitching & Karaoke Alignment**:
   - Sequential REST calls to Sarvam TTS (`https://api.sarvam.ai/text-to-speech`).
   - Decodes Base64 WAV chunks via browser `AudioContext`.
   - Inserts subtle 250ms conversational pauses and stitches everything into a seamless composite 16-bit PCM WAV.
   - Computes exact start and end timestamps (`startTime`, `endTime`) for each dialogue line.

4. **Interactive Studio Player & Synchronized Transcript**:
   - **Karaoke Transcript View**: Highlights active speaker turn in real-time as audio plays, with smooth auto-scroll.
   - **Click-to-Seek**: Click any dialogue line to jump playback directly to that moment.
   - **Audio Controls**: Play/Pause (spacebar), -10s/+10s skip, scrubber bar, speed selector (0.75x–2x), and volume.
   - **Real-Time Audio Visualizer**: Live animated waveform frequency visualizer synced to speech.
   - **Procedural Album Artwork**: Generates vibrant 1:1 square cover art matching the topic and mood.
   - **Export Options**: 1-click Download Full Episode (WAV), Download Artwork (PNG), or Copy Transcript (Markdown).

5. **Hackathon Ready & Resilient**:
   - Built-in **Demo Simulation Mode** allowing judges to experience the full end-to-end podcast flow immediately even before configuring API keys.
   - API Configuration Modal with `localStorage` persistence and direct connection testing.

---

## 🚀 Quick Start (Local Development)

### 1. Clone or Navigate to the directory
```bash
cd ai-podcast-generator
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the project root:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_SARVAM_API_KEY=your_sarvam_api_key_here
```
> *Note: You can also leave these blank and enter them directly into the in-app Settings modal.*

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## ☁️ 1-Click Vercel Deployment

This project is fully Vercel-ready with `vercel.json` and optimized Vite bundling:

1. Push this repository to GitHub.
2. Import the repository into **Vercel**.
3. In Project Settings -> Environment Variables, configure:
   - `VITE_GEMINI_API_KEY`
   - `VITE_SARVAM_API_KEY`
4. Click **Deploy**!

---

## 🛠️ Architecture & Tech Stack

```
ai-podcast-generator/
├── src/
│   ├── components/
│   │   ├── Header.tsx              # Brand bar, API status, key modal trigger
│   │   ├── ConfigPanel.tsx         # Hero input, demo presets, voice selectors
│   │   ├── GenerationProgress.tsx  # Step-by-step pipeline status & line tracker
│   │   ├── EpisodeMetadataCard.tsx # Album art, host badges, takeaways, summary
│   │   ├── PodcastPlayer.tsx       # Web Audio player, scrubber, speed, export
│   │   ├── TranscriptView.tsx      # Auto-scrolling karaoke dialogue turns
│   │   ├── AudioVisualizer.tsx     # Frequency waveform canvas
│   │   ├── CoverArtGenerator.tsx   # Generative 1:1 album artwork canvas
│   │   └── ApiKeyModal.tsx         # Key manager with connection testing
│   ├── services/
│   │   ├── geminiService.ts        # Gemini 2.5 Flash script synthesis
│   │   ├── sarvamService.ts        # Sarvam Bulbul TTS REST client & rate handling
│   │   ├── audioStitcher.ts        # Web Audio API buffer concatenator & timing
│   │   └── mockData.ts             # Indic voice catalog & hackathon demo presets
│   ├── utils/
│   │   ├── wavHelper.ts            # Base64 decoder & PCM WAV binary encoder
│   │   └── formatters.ts           # Time formatter, clipboard & download helpers
│   └── App.tsx                     # Main application orchestrator & state machine
```

---

## 🔑 Obtaining API Keys

- **Google Gemini API**: Free tier available at [Google AI Studio](https://aistudio.google.com/app/apikey)
- **Sarvam AI API**: Sign up and generate your subscription key at [Sarvam AI Dashboard](https://dashboard.sarvam.ai/)

---

## 📜 License
MIT License - Created for AI Hackathons.
