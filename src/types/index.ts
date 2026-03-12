export type PropertyType = 'ltr' | 'str'

export type UserRole =
  | 'family_office_admin'
  | 'org_admin'
  | 'org_viewer'
  | 'advisor'

export interface Property {
  id: string
  org_id: string
  name: string
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  property_type: PropertyType
  purchase_price: number | null
  purchase_date: string | null
  current_market_value: number | null
  ownership_pct: number | null
  mortgage_balance: number | null
  mortgage_rate: number | null
  mortgage_payment: number | null
  qbo_class_id: string | null
  qbo_class_name: string | null
  notes: string | null
  active: boolean
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}
