/**
 * Voice Agent Service - Claude Agent SDK powered voice analysis
 *
 * Uses the official Claude Agent SDK for:
 * - Streaming responses
 * - Automatic tool calling
 * - Session management
 * - Token/cost tracking
 */

import { query } from '@anthropic-ai/claude-agent-sdk'
import OpenAI from 'openai'

export const config = {
  maxDuration: 120, // Allow up to 2 minutes for full pipeline
}

// =============================================================================
// SYSTEM PROMPTS
// =============================================================================

const VOICE_ANALYST_PROMPT = `You are a community voice analyst. Your job is to analyze voice recordings from community members and extract meaningful insights.

When given a transcription of a voice recording, you should:
1. Identify the main themes and topics discussed
2. Extract specific concerns or issues raised
3. Note any suggestions or recommendations made
4. Assess the overall sentiment (positive, neutral, negative)
5. Summarize the key points in 2-3 sentences

Always respond with structured JSON containing:
- themes: array of main themes
- concerns: array of specific concerns
- suggestions: array of actionable suggestions
- sentiment: overall sentiment assessment
- summary: brief summary of the recording

Be concise and actionable. Focus on what matters for community planning.`

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * @typedef {Object} VoiceEvent
 * @property {string} type - Event type
 * @property {string} [provider] - AI provider (claude/openai/whisper)
 * @property {*} [data] - Event data
 * @property {Date} timestamp - When event occurred
 */

// =============================================================================
// TRANSCRIPTION SERVICE
// =============================================================================

/**
 * Transcribe audio using OpenAI Whisper
 * @param {string} audioUrl - URL to audio file
 * @returns {Promise<{text: string, duration: number, language: string}>}
 */
async function transcribeAudio(audioUrl) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Fetch the audio file
  const audioResponse = await fetch(audioUrl)
  if (!audioResponse.ok) {
    throw new Error('Failed to fetch audio file')
  }

  const audioBlob = await audioResponse.blob()
  const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' })

  const transcription = await openai.audio.transcriptions.create({
    file,
    model: 'whisper-1',
    response_format: 'verbose_json',
  })

  return {
    text: transcription.text,
    duration: transcription.duration || 0,
    language: transcription.language || 'en',
  }
}

// =============================================================================
// AGENT EXECUTION
// =============================================================================

/**
 * Run voice analysis agent with streaming events
 * @param {string} audioUrl - URL to audio file
 * @param {string[]} tasks - Tasks to perform ['transcribe', 'analyze']
 * @returns {AsyncGenerator<VoiceEvent>}
 */
export async function* runVoiceAgent(audioUrl, tasks = ['transcribe', 'analyze']) {
  const startedAt = Date.now()

  // Emit start event
  yield {
    type: 'start',
    audioUrl,
    tasks,
    timestamp: new Date(),
  }

  let transcription = null
  let inputTokens = 0
  let outputTokens = 0
  let totalCost = 0

  // Step 1: Transcribe audio
  if (tasks.includes('transcribe')) {
    yield {
      type: 'transcribing',
      provider: 'whisper',
      timestamp: new Date(),
    }

    try {
      transcription = await transcribeAudio(audioUrl)

      yield {
        type: 'transcribed',
        provider: 'whisper',
        text: transcription.text,
        duration: transcription.duration,
        language: transcription.language,
        timestamp: new Date(),
      }
    } catch (error) {
      yield {
        type: 'error',
        provider: 'whisper',
        error: error.message,
        timestamp: new Date(),
      }
      return
    }
  }

  // Step 2: Analyze with Claude Agent SDK
  if (tasks.includes('analyze') && transcription?.text) {
    yield {
      type: 'analyzing',
      provider: 'claude',
      timestamp: new Date(),
    }

    try {
      // Use Claude Agent SDK for analysis
      const agent = query({
        prompt: `Analyze this community voice recording transcription and provide structured insights:\n\n"${transcription.text}"`,
        options: {
          model: 'claude-sonnet-4-20250514',
          systemPrompt: VOICE_ANALYST_PROMPT,
          maxTurns: 1,
          maxBudgetUsd: 0.10,
        },
      })

      let analysisText = ''
      let providerSessionId = null

      // Stream events from the agent
      for await (const event of agent) {
        switch (event.type) {
          case 'system':
            if (event.subtype === 'init') {
              providerSessionId = event.session_id
              yield {
                type: 'agent_init',
                provider: 'claude',
                sessionId: providerSessionId,
                model: event.model,
                timestamp: new Date(),
              }
            }
            break

          case 'assistant':
            // Extract text from message content
            for (const block of event.message.content) {
              if ('text' in block && block.text) {
                analysisText += block.text
                yield {
                  type: 'analysis_delta',
                  provider: 'claude',
                  content: block.text,
                  timestamp: new Date(),
                }
              }
            }
            break

          case 'result':
            if (event.subtype === 'success') {
              inputTokens = event.usage?.input_tokens || 0
              outputTokens = event.usage?.output_tokens || 0
              totalCost = event.total_cost_usd || 0
            }
            break
        }
      }

      // Parse the analysis JSON
      let analysis = null
      try {
        // Try to extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0])
        }
      } catch (e) {
        // If JSON parsing fails, structure the response
        analysis = {
          summary: analysisText,
          themes: [],
          concerns: [],
          suggestions: [],
          sentiment: 'neutral',
        }
      }

      yield {
        type: 'analyzed',
        provider: 'claude',
        analysis,
        timestamp: new Date(),
      }

    } catch (error) {
      yield {
        type: 'error',
        provider: 'claude',
        error: error.message,
        timestamp: new Date(),
      }
    }
  }

  // Emit completion event with stats
  const durationMs = Date.now() - startedAt

  yield {
    type: 'complete',
    stats: {
      inputTokens,
      outputTokens,
      cost: totalCost,
      durationMs,
      transcriptionDuration: transcription?.duration || 0,
    },
    timestamp: new Date(),
  }
}

// =============================================================================
// HTTP HANDLER
// =============================================================================

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { audioUrl, tasks = ['transcribe', 'analyze'] } = req.body

  if (!audioUrl) {
    return res.status(400).json({ error: 'audioUrl is required' })
  }

  // Set up SSE headers for streaming
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    // Stream events to client
    for await (const event of runVoiceAgent(audioUrl, tasks)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`)
    }

    res.write('data: [DONE]\n\n')
    res.end()

  } catch (error) {
    // Send error event
    res.write(`data: ${JSON.stringify({
      type: 'error',
      error: error.message,
      timestamp: new Date(),
    })}\n\n`)
    res.end()
  }
}
