#!/usr/bin/env node
/**
 * CGA Community Voice Analysis Script
 * Uses Claude CLI (headless) with --print to analyze community responses
 * Uses your Claude subscription, not API credits
 *
 * Usage:
 *   node scripts/analyze-responses.js                    # Analyze all, print to console
 *   node scripts/analyze-responses.js --out              # Analyze all, save to markdown
 *   node scripts/analyze-responses.js land               # Analyze just Land pillar
 *   node scripts/analyze-responses.js land --out         # Analyze Land, save to markdown
 *   node scripts/analyze-responses.js land housing --out # Multiple pillars to markdown
 *
 * Available pillars: land, capital, arts, housing, enterprise
 * Output: docs/cga-analysis-report.md (when --out flag used)
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Output buffer for markdown file
let markdownOutput = '';
let saveToFile = false;

// Helper to output text (console and/or markdown)
function output(text) {
  console.log(text);
  if (saveToFile) {
    markdownOutput += text + '\n';
  }
}

// Pillar configurations
const PILLARS = [
  { name: 'Land', file: 'responses-land.csv' },
  { name: 'Capital', file: 'responses-capital.csv' },
  { name: 'Arts', file: 'responses-arts.csv' },
  { name: 'Housing', file: 'responses-housing.csv' },
  { name: 'Enterprise', file: 'responses-enterprise.csv' },
];

// Parse CSV into array of objects
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = parseCSVLine(lines[0]);

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }
  return rows;
}

// Parse a single CSV line (handles quoted fields)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Format responses for Claude
function formatResponsesForAnalysis(responses) {
  const byQuestion = {};
  responses.forEach(r => {
    const qNum = r.question_num;
    if (!byQuestion[qNum]) {
      byQuestion[qNum] = {
        question: r.question_text,
        responses: []
      };
    }
    byQuestion[qNum].responses.push({
      name: r.full_name,
      neighborhood: r.neighborhood,
      channel: r.channel,
      sentiment: r.sentiment,
      text: r.response_text
    });
  });

  let formatted = '';
  Object.keys(byQuestion).sort().forEach(qNum => {
    const q = byQuestion[qNum];
    formatted += `\nQuestion ${qNum}: "${q.question}"\n\n`;
    q.responses.forEach((r, i) => {
      formatted += `[${r.name}, ${r.neighborhood}, ${r.channel}]: "${r.text}"\n\n`;
    });
  });

  return formatted;
}

// Call Claude CLI with --print and --model sonnet
function callClaude(prompt) {
  // Write prompt to temp file to avoid shell escaping issues
  const tempFile = path.join(__dirname, '.temp-prompt.txt');
  fs.writeFileSync(tempFile, prompt);

  try {
    const result = execSync(
      `cat "${tempFile}" | claude --print --model sonnet`,
      {
        encoding: 'utf-8',
        maxBuffer: 10 * 1024 * 1024, // 10MB buffer
        timeout: 300000 // 5 minute timeout
      }
    );
    return result;
  } finally {
    // Clean up temp file
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
  }
}

// Analyze a single pillar
function analyzePillar(pillarName, responses) {
  const formattedResponses = formatResponsesForAnalysis(responses);
  const uniqueRespondents = new Set(responses.map(r => r.respondent_id)).size;

  const prompt = `You are analyzing community voice responses from North College Hill, Ohio for the Common Good Alliance. These are residents sharing their thoughts on ${pillarName.toUpperCase()}.

Here are ${responses.length} responses from ${uniqueRespondents} community members:

${formattedResponses}

Analyze these responses and provide:

1. **TOP THEMES** (3-5 themes with approximate % of responses mentioning each)

2. **CONSENSUS POINTS** (What do most people agree on?)

3. **KEY CONCERNS** (What worries or frustrates residents?)

4. **SUGGESTIONS** (What do residents want to see happen?)

5. **NOTABLE QUOTES** (3-4 powerful direct quotes)

6. **SENTIMENT BREAKDOWN** (Overall tone)

7. **SUMMARY** (2-3 sentence executive summary)

Be specific and actionable.`;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ANALYZING: ${pillarName.toUpperCase()} PILLAR`);
  console.log(`  ${responses.length} responses from ${uniqueRespondents} residents`);
  console.log(`${'='.repeat(60)}\n`);

  const analysis = callClaude(prompt);
  console.log(analysis);

  // Add to markdown output
  if (saveToFile) {
    markdownOutput += `## ${pillarName.toUpperCase()} PILLAR

*${responses.length} responses from ${uniqueRespondents} residents*

${analysis}

---

`;
  }

  return analysis;
}

// Generate final combined report
function generateFinalReport(pillarAnalyses) {
  const combinedAnalyses = pillarAnalyses.map(p =>
    `## ${p.name} PILLAR\n\n${p.analysis}`
  ).join('\n\n---\n\n');

  const prompt = `You analyzed community voice responses across 5 strategic pillars for the Common Good Alliance in North College Hill, Ohio. Here are the pillar analyses:

${combinedAnalyses}

Synthesize into a final EXECUTIVE BRIEF:

1. **OVERALL COMMUNITY PRIORITIES** - What matters most across all pillars?

2. **CROSS-CUTTING THEMES** - What themes appear in multiple pillars?

3. **IMMEDIATE ACTION ITEMS** - What should CGA focus on first?

4. **LONG-TERM OPPORTUNITIES** - What bigger initiatives does the community support?

5. **COMMUNITY STRENGTHS** - What assets and energy can CGA build on?

Keep it concise and actionable for executive leadership.`;

  console.log(`\n${'#'.repeat(60)}`);
  console.log(`  EXECUTIVE BRIEF: COMMON GOOD ALLIANCE`);
  console.log(`  North College Hill Community Voice Campaign`);
  console.log(`${'#'.repeat(60)}\n`);

  const report = callClaude(prompt);
  console.log(report);

  // Add to markdown output
  if (saveToFile) {
    markdownOutput += `# EXECUTIVE BRIEF

**Common Good Alliance - North College Hill Community Voice Campaign**

${report}
`;
  }

  return report;
}

// Main execution
function main() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     COMMON GOOD ALLIANCE - COMMUNITY VOICE ANALYSIS        ║');
  console.log('║     North College Hill, Hamilton County, Ohio              ║');
  console.log('║     Using Claude CLI (Sonnet) - Headless Mode              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('\n');

  const dataDir = path.join(__dirname, '..', 'data');
  const pillarAnalyses = [];

  // Parse command line args
  const args = process.argv.slice(2).map(a => a.toLowerCase());

  // Check for --out flag
  saveToFile = args.includes('--out');
  const pillarArgs = args.filter(a => a !== '--out');

  let pillarsToRun = PILLARS;

  if (pillarArgs.length > 0) {
    pillarsToRun = PILLARS.filter(p =>
      pillarArgs.includes(p.name.toLowerCase())
    );

    if (pillarsToRun.length === 0) {
      console.error('ERROR: No valid pillars specified.');
      console.error('Available: land, capital, arts, housing, enterprise');
      process.exit(1);
    }

    console.log(`Running analysis for: ${pillarsToRun.map(p => p.name).join(', ')}`);
  } else {
    console.log('Running analysis for all pillars');
  }

  if (saveToFile) {
    console.log('Output will be saved to: docs/cga-analysis-report.md\n');
    // Start markdown file with header
    markdownOutput = `# Common Good Alliance - Community Voice Analysis

**Location:** North College Hill, Hamilton County, Ohio
**Generated:** ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
**Pillars Analyzed:** ${pillarsToRun.map(p => p.name).join(', ')}

---

`;
  } else {
    console.log('\n');
  }

  // Check if data files exist
  for (const pillar of pillarsToRun) {
    const filePath = path.join(dataDir, pillar.file);
    if (!fs.existsSync(filePath)) {
      console.error(`ERROR: Missing data file: ${filePath}`);
      console.error('Run the data generation script first.');
      process.exit(1);
    }
  }

  // Analyze each pillar
  for (const pillar of pillarsToRun) {
    const filePath = path.join(dataDir, pillar.file);
    const responses = parseCSV(filePath);

    try {
      const analysis = analyzePillar(pillar.name, responses);
      pillarAnalyses.push({ name: pillar.name, analysis });
    } catch (error) {
      console.error(`Error analyzing ${pillar.name}:`, error.message);
    }
  }

  // Generate final executive brief (only if all 5 pillars analyzed)
  if (pillarAnalyses.length === PILLARS.length) {
    generateFinalReport(pillarAnalyses);
  } else if (pillarAnalyses.length > 0) {
    console.log('\n');
    console.log('─'.repeat(60));
    console.log('  Skipping Executive Brief (run all 5 pillars to generate)');
    console.log('─'.repeat(60));
  }

  // Save to markdown file if --out flag was used
  if (saveToFile) {
    const outputPath = path.join(__dirname, '..', 'docs', 'cga-analysis-report.md');
    fs.writeFileSync(outputPath, markdownOutput);
    console.log('\n');
    console.log('═'.repeat(60));
    console.log(`  Analysis saved to: docs/cga-analysis-report.md`);
    console.log('═'.repeat(60));
  } else {
    console.log('\n');
    console.log('═'.repeat(60));
    console.log('  Analysis complete.');
    console.log('═'.repeat(60));
  }
  console.log('\n');
}

// Run
main();
