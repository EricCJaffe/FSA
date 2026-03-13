/**
 * Quick test to verify OpenAI API connectivity.
 * Run: npx tsx scripts/test-openai.ts
 *
 * Requires OPENAI_API_KEY in .env.local or environment.
 */

import 'dotenv/config'

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set. Add it to .env.local or export it.')
    process.exit(1)
  }

  console.log('API key found:', apiKey.slice(0, 8) + '...' + apiKey.slice(-4))
  console.log('Sending test request to OpenAI...\n')

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are a property investment analyst. Be brief.',
        },
        {
          role: 'user',
          content: 'In one sentence, what is a good cap rate for a rental property in Jacksonville, FL?',
        },
      ],
      temperature: 0.3,
      max_tokens: 100,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    console.error(`OpenAI API error (${res.status}):`, body)
    process.exit(1)
  }

  const data = await res.json()
  const reply = data.choices[0].message.content

  console.log('Model:', data.model)
  console.log('Response:', reply)
  console.log('\nOpenAI connection successful!')
}

testOpenAI().catch((err) => {
  console.error('Failed:', err.message)
  process.exit(1)
})
