import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDeal, type PropertyType } from '@/lib/deal-analyzer/calculator'

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

    // Validate required fields
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

    // Run calculator
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

    // Insert into database
    const { data: analysis, error: insertError } = await supabase
      .from('deal_analyses')
      .insert({
        org_id: role.org_id,
        user_id: user.id,
        property_name: body.propertyName,
        property_address: body.propertyAddress,
        property_type: body.propertyType,
        year_built: body.yearBuilt || null,
        beds: body.beds || null,
        baths: body.baths || null,
        sqft: body.sqft || null,
        county: body.county || null,
        mls_number: body.mlsNumber || null,
        list_price: body.listPrice || body.allInCost,
        all_in_cost: body.allInCost,
        monthly_rent: body.monthlyRent,
        hoa_monthly: body.hoaMonthly ?? 0,
        annual_taxes: body.annualTaxes || null,
        annual_insurance: body.annualInsurance || null,
        management_pct: body.managementPct ?? 0.08,
        annual_repairs: body.annualRepairs || null,
        vacancy_pct: body.vacancyPct ?? 0.05,
        computed_noi: result.noi,
        computed_cash_on_cash: result.cashOnCash,
        computed_gross_yield: result.grossYield,
        verdict: result.verdict,
        verdict_reason: result.verdictReason,
        target_offer_price: result.targetOfferPrice,
      })
      .select()
      .single()

    if (insertError) {
      throw new Error(`Failed to save analysis: ${insertError.message}`)
    }

    return NextResponse.json({
      success: true,
      analysis,
      result,
    })
  } catch (err) {
    console.error('Deal analysis failed:', err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'Analysis failed',
      },
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
