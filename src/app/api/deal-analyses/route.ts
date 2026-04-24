import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { analyzeDeal, type PropertyType } from '@/lib/deal-analyzer/calculator'

function getAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id, role')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (
    !role ||
    (role.role !== 'family_office_admin' && role.role !== 'org_admin')
  ) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json()

    if (!body.propertyName || !body.propertyAddress || !body.propertyType) {
      return NextResponse.json(
        { error: 'propertyName, propertyAddress, and propertyType are required' },
        { status: 400 }
      )
    }
    if (!body.allInCost || body.allInCost <= 0) {
      return NextResponse.json(
        { error: 'allInCost must be a positive number' },
        { status: 400 }
      )
    }
    if (!body.monthlyRent || body.monthlyRent <= 0) {
      return NextResponse.json(
        { error: 'monthlyRent must be a positive number' },
        { status: 400 }
      )
    }

    const result = analyzeDeal({
      propertyType: body.propertyType as PropertyType,
      allInCost: body.allInCost,
      monthlyRent: body.monthlyRent,
      hoaMonthly: body.hoaMonthly ?? 0,
      annualTaxes: body.annualTaxes || null,
      annualInsurance: body.annualInsurance || null,
      managementPct: body.managementPct ?? 0.08,
      annualRepairs: body.annualRepairs || null,
      vacancyPct: body.vacancyPct ?? 0.05,
      yearBuilt: body.yearBuilt || null,
      county: body.county || null,
    })

    // Use admin client to bypass RLS for insert
    const admin = getAdmin()

    const row = {
      org_id: role.org_id,
      user_id: user.id,
      property_name: body.propertyName,
      property_address: body.propertyAddress,
      property_type: body.propertyType,
      year_built: body.yearBuilt ? Math.round(body.yearBuilt) : null,
      beds: body.beds || null,
      baths: body.baths || null,
      sqft: body.sqft ? Math.round(body.sqft) : null,
      county: body.county || null,
      mls_number: body.mlsNumber || null,
      list_price: Math.round(body.listPrice || body.allInCost),
      all_in_cost: Math.round(body.allInCost),
      monthly_rent: Math.round(body.monthlyRent),
      hoa_monthly: Math.round(body.hoaMonthly ?? 0),
      annual_taxes: body.annualTaxes ? Math.round(body.annualTaxes) : null,
      annual_insurance: body.annualInsurance ? Math.round(body.annualInsurance) : null,
      management_pct: body.managementPct ?? 0.08,
      annual_repairs: body.annualRepairs ? Math.round(body.annualRepairs) : null,
      vacancy_pct: body.vacancyPct ?? 0.05,
      computed_noi: Math.round(result.noi),
      computed_cash_on_cash: Math.round(result.cashOnCash * 1000000) / 1000000,
      computed_gross_yield: Math.round(result.grossYield * 1000000) / 1000000,
      verdict: result.verdict,
      verdict_reason: result.verdictReason,
      target_offer_price: result.targetOfferPrice ? Math.round(result.targetOfferPrice) : null,
    }

    const { data: analysis, error: insertError } = await admin
      .from('deal_analyses')
      .insert(row)
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: `Failed to save: ${insertError.message} (${insertError.code})` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      analysis,
      result,
    })
  } catch (err) {
    console.error('Deal analysis failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: role } = await supabase
    .from('user_org_roles')
    .select('org_id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!role) {
    return NextResponse.json(
      { error: 'No organization found' },
      { status: 400 }
    )
  }

  const { data: analyses } = await supabase
    .from('deal_analyses')
    .select('*')
    .eq('org_id', role.org_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ analyses: analyses ?? [] })
}
