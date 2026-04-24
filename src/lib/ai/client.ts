/**
 * AI client — multi-model routing.
 * Primary: OpenAI GPT-4o (user preference)
 * Fallback: Anthropic Claude (if configured)
 *
 * Both use simple fetch-based calls — no SDK dependency needed.
 */

interface AiResponse {
  content: string
  model: string
}

async function callOpenAI(prompt: string, systemPrompt: string, maxTokens: number): Promise<AiResponse> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('OPENAI_API_KEY not configured')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`OpenAI API error (${res.status}): ${body}`)
  }

  const data = await res.json()
  return {
    content: data.choices[0].message.content,
    model: 'gpt-4o',
  }
}

async function callAnthropic(prompt: string, systemPrompt: string, maxTokens: number): Promise<AiResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Anthropic API error (${res.status}): ${body}`)
  }

  const data = await res.json()
  return {
    content: data.content[0].text,
    model: 'claude-sonnet-4-20250514',
  }
}

/**
 * Generate AI content with automatic fallback.
 * Tries OpenAI first (if configured), then Anthropic.
 */
export async function generateAiContent(
  prompt: string,
  systemPrompt: string,
  maxTokens: number = 2000
): Promise<AiResponse> {
  // Try OpenAI first
  if (process.env.OPENAI_API_KEY) {
    try {
      return await callOpenAI(prompt, systemPrompt, maxTokens)
    } catch (err) {
      console.warn('OpenAI failed, trying Anthropic fallback:', err)
    }
  }

  // Try Anthropic
  if (process.env.ANTHROPIC_API_KEY) {
    return await callAnthropic(prompt, systemPrompt, maxTokens)
  }

  throw new Error('No AI provider configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.')
}
