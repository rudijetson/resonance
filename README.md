# MIC - Market, Impact & Consensus

Collab's time-boxed civic listening campaign platform. Capture resident voice at scale, identify where true agreement and disagreement exist, and produce decision-ready direction for community redevelopment.

## Overview

MIC (Market, Impact & Consensus) modernizes the traditional "town hall mic" by combining opt-in phone and web voice capture with transcription, structured data, and synthesis—producing an executive brief that leaders can use to guide planning, de-risk projects, and build legitimacy early.

MIC is built for the realities of redevelopment: multiple stakeholders, limited trust, and high political risk. Rather than relying on a small number of loud voices or one-off meetings, MIC creates a repeatable process to gather input across residents, businesses, and institutions—then converts those inputs into a clear **Consensus Map**: what the community supports, what it opposes, what tradeoffs it will accept, and what decision points require further alignment.

## Campaign Deliverables

- **MIC Alignment Brief** — "What we heard"
- **Consensus Map** — Support, opposition, and tradeoff themes
- **Prioritized Community Needs** — Ranked by frequency and intensity
- **Civic-Safe Appendix** — Anonymized excerpts and structured data
- **Optional Enhancements** — Precedent research boards and site-context visuals

## How It Works

1. **Define Campaign** — Set time box, target stakeholders, and key questions
2. **Capture Voice** — Residents share via phone or web (opt-in, anonymous, accessible)
3. **Transcribe & Synthesize** — AI-assisted analysis converts input to structured data
4. **Deliver Consensus Map** — Decision-ready direction for Phase 0 work

## Use Cases

### Municipal Redevelopment
- Downtown revitalization planning
- Economic development initiatives
- Infrastructure investment decisions
- Zoning and land use changes

### Community Organizations
- Neighborhood planning input
- Capital campaign prioritization
- Program design feedback
- Stakeholder alignment

### Phase 0 Support
- Feasibility study input
- Funding narrative support
- Stakeholder buy-in documentation
- Political risk assessment

## Technology Stack

### Frontend
- HTML5 Web Audio API for browser-native recording
- Vanilla JavaScript with zero dependencies
- CSS3 with responsive design
- Progressive Web App capabilities

### Backend
- Vercel hosting with global CDN
- Vercel Blob for audio storage
- Serverless API routes
- OpenAI Whisper for transcription

### AI Pipeline
- Whisper API for audio transcription
- GPT-4 for theme synthesis and analysis
- Structured output for Consensus Mapping

## Project Structure

```
mic/
├── index.html                 # Landing page
├── pages/                     # Application pages
│   ├── voice.html            # Recording interface
│   ├── organizations.html    # Campaign information
│   ├── create.html           # Campaign setup
│   ├── admin.html            # Admin dashboard
│   ├── analytics.html        # Campaign analytics
│   └── report-example.html   # Sample Alignment Brief
├── css/                       # Stylesheets
│   ├── main.css              # Primary styles
│   └── mobile.css            # Mobile overrides
├── js/                        # JavaScript
│   └── app.js                # Core application logic
├── api/                       # Serverless API routes
│   ├── upload.js             # Audio upload handler
│   ├── recordings.js         # Recording list endpoint
│   └── health.js             # Health check
└── images/                    # Assets
```

## Getting Started

### Prerequisites
- Node.js 18+
- Vercel CLI (`npm install -g vercel`)
- Vercel account with Blob storage enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/collab/mic.git
cd mic

# Install dependencies
npm install

# Start local development
npm start
```

### Environment Variables

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
OPENAI_API_KEY=your_openai_key (optional, for transcription)
```

## Campaign Pricing

MIC can be deployed as a standalone engagement campaign or bundled into Phase 0 as the legitimacy and adoption layer that makes redevelopment strategies politically and socially executable.

- **Standard Campaign** — 30-day time box, web capture, Alignment Brief
- **Extended Campaign** — 60-day time box, phone + web, enhanced synthesis
- **Enterprise** — Custom duration, multi-channel, precedent research

## Security & Privacy

- Anonymous by design — no personal data collected
- Opt-in participation only
- GDPR/CCPA compliant
- Civic-safe output suitable for public distribution
- Configurable data retention policies

## Contributing

This is a Collab product. For partnership inquiries, contact the team.

---

**MIC** — Civic listening that builds legitimacy and de-risks redevelopment.
