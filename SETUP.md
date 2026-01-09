# Resonance Setup Guide

## Quick Start for Demo

### 1. Environment Variables Setup

You need three environment variables to run Resonance:

#### **OPENAI_API_KEY** (Required)
- Used for: Whisper audio transcription
- Get it from: https://platform.openai.com/api-keys
- Format: `sk-proj-...`

#### **ANTHROPIC_API_KEY** (Required)
- Used for: Claude Agent SDK voice analysis
- Get it from: https://console.anthropic.com/settings/keys
- Format: `sk-ant-...`

#### **BLOB_READ_WRITE_TOKEN** (Auto-generated)
- Used for: Vercel Blob storage for audio files
- This is automatically created by Vercel - no manual setup needed

---

## Local Development

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Configure Environment Variables
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your real API keys
# Replace the placeholder values with actual keys
```

### Step 3: Pull Vercel Environment (Optional)
```bash
# This will pull BLOB_READ_WRITE_TOKEN from Vercel
vercel env pull .env.local
```

### Step 4: Start Development Server
```bash
npm run dev
```

### Step 5: Test the App
Open http://localhost:3000/pages/voice.html

---

## Vercel Production Deployment

### Option A: Using Vercel Dashboard (Recommended)
1. Go to https://vercel.com/dashboard
2. Select your project: **resonance**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Name | Value | Environment |
|------|-------|-------------|
| `OPENAI_API_KEY` | `sk-proj-...` | Production, Preview, Development |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Production, Preview, Development |

5. Blob storage token is auto-created when you deploy

### Option B: Using Vercel CLI
```bash
# Add environment variables (you'll be prompted for values)
vercel env add OPENAI_API_KEY production
vercel env add ANTHROPIC_API_KEY production

# Deploy to production
vercel --prod
```

---

## Testing the Demo

### 1. Voice Recording
- Open the app
- Click the microphone button
- Grant microphone permissions
- Record your message (max 5 minutes)
- Click again to stop

### 2. Backend Pipeline
The following happens automatically:
1. Audio uploads to Vercel Blob storage
2. Whisper transcribes the audio
3. Claude Agent analyzes themes and sentiment
4. Results stream back to the user

### 3. API Endpoints
- `POST /api/upload` - Upload audio file
- `POST /api/agent` - Run full AI pipeline with streaming
- `GET /api/recordings?org=<orgId>` - Get recording count
- `GET /api/health` - Health check

---

## Troubleshooting

### "No environment variables found"
Run: `vercel env add OPENAI_API_KEY` and follow prompts

### "Upload failed"
- Check if BLOB_READ_WRITE_TOKEN is set
- Verify Vercel Blob storage is enabled for your project

### "Transcription failed"
- Verify OPENAI_API_KEY is valid
- Check OpenAI account has credits

### "Analysis failed"
- Verify ANTHROPIC_API_KEY is valid
- Check Anthropic account has credits

---

## Architecture Overview

```
Browser Recording → Vercel Blob Storage
                         ↓
                  /api/agent endpoint
                         ↓
              OpenAI Whisper (transcribe)
                         ↓
            Claude Agent SDK (analyze)
                         ↓
              Server-Sent Events (SSE)
                         ↓
                  Browser (results)
```

---

## Cost Estimates

- **Whisper**: ~$0.006 per minute of audio
- **Claude Sonnet 4**: ~$0.003 per message analysis (typical)
- **Vercel Blob**: $0.15/GB storage + $2/GB bandwidth
- **Total per voice**: ~$0.02-0.05 for 2-3 minute recording

---

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test locally with `npm run dev`
3. ✅ Deploy to Vercel with `vercel --prod`
4. ✅ Share demo link: `https://your-project.vercel.app/pages/voice.html`

For questions or issues, check the logs:
```bash
vercel logs
```
