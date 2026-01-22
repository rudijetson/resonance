# Common Good Alliance - Community Voice Demo

**A demonstration of the MIC (Municipal Input & Consensus) platform for civic engagement.**

This demo shows how the Community Voice Line system would work for Common Good Alliance's campaign in North College Hill, Ohio.

---

## What's Included

### 📋 Question Bank
**[question-bank.html](./question-bank.html)**

The questions CGA would ask across their 5 strategic pillars:
- **Land** - Vacant properties, community land trust, development
- **Capital** - Investment barriers, community fund, economic opportunity
- **Arts & Culture** - Heritage preservation, public art, cultural events
- **Housing** - Rent vs. own, affordability, homeownership barriers
- **Enterprise** - Missing businesses, Black-owned business support

### 📊 Sample Data
**[sample-data/](./sample-data/)**

Simulated community responses representing 250 North College Hill residents:

| File | Pillar | Respondents | Responses |
|------|--------|-------------|-----------|
| `responses-land.csv` | Land | 50 | 200 |
| `responses-capital.csv` | Capital | 50 | 200 |
| `responses-arts.csv` | Arts & Culture | 50 | 200 |
| `responses-housing.csv` | Housing | 50 | 200 |
| `responses-enterprise.csv` | Enterprise | 50 | 200 |

**Total: 250 residents, 1,000 response records**

Data includes:
- Realistic names reflecting NCH demographics (61.6% Black)
- Real place references (Hamilton Ave, Stapleton Park, etc.)
- Actual business names (1996 Eatery, Real Deal Boxing, etc.)
- Mixed sentiment (positive/neutral/negative)
- Multiple channels (web/phone/SMS)

### 📈 Analysis
**[analysis/](./analysis/)**

- **cga-analysis-report.md** - Full AI-generated analysis of all responses
- **analyze-responses.js** - Script to run analysis using Claude CLI
- **response-schema.json** - CSV schema definition

**To run analysis:**
```bash
# Analyze one pillar
node cga-demo/analysis/analyze-responses.js land

# Analyze all pillars and save to markdown
node cga-demo/analysis/analyze-responses.js --out
```

### 📑 Final Report
**[community-voice-report.html](./community-voice-report.html)**

Professional HTML report for decision-makers showing:
- Executive summary with key takeaways
- Community priorities ranked by support
- Pillar-by-pillar findings, consensus points, concerns
- Community voices (quotes)
- Implementation roadmap (0-6mo, 6-18mo, 2-5yr)

### 🔍 Research
**[research/](./research/)**

Background research on North College Hill used to generate realistic sample data:
- Demographics and income data
- Geographic context and neighborhoods
- Current community issues
- Black-owned businesses
- Historical context

---

## The Flow

```
1. Question Bank     → Define what to ask the community
         ↓
2. Community Input   → Residents respond via web/phone/SMS
         ↓
3. Sample Data       → Raw responses collected (CSV)
         ↓
4. AI Analysis       → Claude extracts themes, consensus, concerns
         ↓
5. Final Report      → Decision-ready insights for leadership
```

---

## About Common Good Alliance

**Mission:** Cultivate the social infrastructure for the common good by investing in local assets and business talent, while leveraging the economic power of the Black dollar.

**Values:** Compassion · Trust · Radical Collaboration

**Tagline:** "Moving the Dollar in Our Community"

---

## Key Findings from Demo

| Metric | Value |
|--------|-------|
| Land trust support | 78% |
| Community investment fund interest | 95% |
| Healthcare gap (pharmacy/urgent care) | 86% cite as critical |
| Black-owned business awareness | 94% |

**Top Community Priorities:**
1. Community Land Trust
2. Healthcare Access (pharmacy, urgent care)
3. Community Investment Fund
4. Vacant Property Intervention
5. Down Payment Assistance
6. Heritage Documentation (urgent - elders aging)

---

## Technical Stack

- **Data Generation:** Claude AI via subagents
- **Analysis:** Claude CLI (`claude --print --model sonnet`)
- **Output:** HTML reports, Markdown, CSV
- **No database required** for demo (CSV-based)

---

*Demo created January 2026 for Common Good Alliance presentation.*
