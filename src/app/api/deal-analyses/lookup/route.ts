import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAiContent } from '@/lib/ai/client'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { address, propertyType, askingPrice } = body

    if (!address) {
      return NextResponse.json(
        { error: 'address is required' },
        { status: 400 }
      )
    }

    const systemPrompt = `You are a real estate data analyst specializing in Northeast Florida (Jacksonville, Orange Park, Clay County, Duval County). You research properties and provide estimated financial details for investment analysis.

You MUST respond with valid JSON only — no markdown, no explanation, no code fences. Just the JSON object.`

    const userPrompt = `Research this property and provide estimated financial details for a rental investment analysis:

Address: ${address}
${propertyType ? `Property Type: ${propertyType}` : ''}
${askingPrice ? `Asking Price: $${askingPrice.toLocaleString()}` : ''}

Based on your knowledge of this area, property type, and typical values for this location, provide your best estimates. For any field you're uncertain about, still give a reasonable estimate based on comparable properties in the area.

Return a JSON object with these fields (use null only if truly unknowable):
{
  "propertyName": "short name for the property (e.g. street address or nickname)",
  "propertyType": "sfh" | "townhouse" | "condo" | "duplex" | "multifamily",
  "yearBuilt": number or null,
  "beds": number or null,
  "baths": number or null,
  "sqft": number or null,
  "county": "county name without 'County'",
  "estimatedValue": number (your estimate of market value),
  "estimatedMonthlyRent": number (realistic monthly LTR rent for this property),
  "estimatedAnnualTaxes": number (property tax estimate based on county millage rates),
  "estimatedAnnualInsurance": number (FL homeowner insurance estimate for this type),
  "estimatedHoaMonthly": number (0 if no HOA expected),
  "estimatedAnnualRepairs": number (maintenance budget estimate),
  "managementPct": 0.08,
  "vacancyPct": 0.05,
  "notes": "brief explanation of how you estimated these values and any caveats",
  "comps": "brief note on comparable properties or rent comps you based estimates on"
}`

    const response = await generateAiContent(userPrompt, systemPrompt)

    // Parse the AI response as JSON
    let parsed
    try {
      // Strip potential markdown code fences
      let cleaned = response.content.trim()
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(cleaned)
    } catch {
      return NextResponse.json(
        { error: 'AI returned invalid data. Try again.', raw: response.content },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      lookup: parsed,
      model: response.model,
    })
  } catch (err) {
    console.error('Deal lookup failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Lookup failed' },
      { status: 500 }
    )
  }
}
