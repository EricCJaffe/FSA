/**
 * QBO Report parser.
 *
 * QBO's Report API returns a deeply nested row/column structure.
 * This module flattens it into typed financial line items that can be
 * stored directly in `financial_line_items`.
 *
 * Report structure:
 * - Columns: [Account, Class1, Class2, ..., Total]
 * - Rows: nested sections (Income, Expenses, etc.) with leaf rows containing ColData
 */

import type {
  QboReport,
  QboReportRow,
  ParsedFinancialLine,
} from './types'

/**
 * Extract class names from report column headers.
 * First column is always the account name, last is usually "Total".
 * Middle columns are class names.
 */
function getClassColumns(report: QboReport): (string | null)[] {
  const columns = report.Columns.Column
  // Skip first column (account name), map the rest
  return columns.slice(1).map((col) => {
    const title = col.ColTitle
    if (!title || title === 'Total' || title === 'TOTAL') return null
    return title
  })
}

/**
 * Determine account type from the section group name.
 */
function resolveAccountType(
  sectionGroup: string
): 'income' | 'expense' | 'other_income' | 'asset' | 'liability' | 'equity' | null {
  const g = sectionGroup.toLowerCase()
  if (g.includes('income') && !g.includes('other') && !g.includes('expense')) return 'income'
  if (g.includes('other income') || g.includes('otherincome')) return 'other_income'
  if (g.includes('expense') || g.includes('cost of goods')) return 'expense'
  // Balance sheet: match both top-level sections and QBO sub-sections
  if (g.includes('asset') || g.includes('bank account') || g.includes('accounts receivable')
    || g.includes('other current asset') || g.includes('fixed asset') || g.includes('other asset')) return 'asset'
  if (g.includes('liability') || g.includes('liabilities') || g.includes('accounts payable')
    || g.includes('credit card')) return 'liability'
  if (g.includes('equity') || g.includes('stockholder') || g.includes('owner')) return 'equity'
  return null // unknown — caller should fall back to parent group
}

/** resolveAccountType with a fallback for P&L contexts where null isn't expected */
function resolveAccountTypeStrict(
  sectionGroup: string
): 'income' | 'expense' | 'other_income' | 'asset' | 'liability' | 'equity' {
  return resolveAccountType(sectionGroup) ?? 'expense'
}

/**
 * Recursively walk report rows and extract leaf data rows.
 */
function walkRows(
  rows: QboReportRow[],
  classColumns: (string | null)[],
  currentGroup: string,
  results: ParsedFinancialLine[]
): void {
  for (const row of rows) {
    const group = row.group || currentGroup

    // Leaf data row — has ColData directly
    if (row.ColData) {
      const accountName = row.ColData[0]?.value
      if (!accountName) continue

      const accountType = resolveAccountTypeStrict(group)

      // Each subsequent column corresponds to a class (or total)
      for (let i = 1; i < row.ColData.length; i++) {
        const rawValue = row.ColData[i]?.value
        if (!rawValue || rawValue === '' || rawValue === '0') continue

        const amount = parseFloat(rawValue.replace(/,/g, ''))
        if (isNaN(amount) || amount === 0) continue

        const className = classColumns[i - 1] ?? null

        results.push({
          accountName,
          accountType,
          amount: Math.abs(amount), // Store as positive; sign determined by type
          className,
        })
      }
    }

    // Section with nested rows
    if (row.Rows?.Row) {
      walkRows(row.Rows.Row, classColumns, group, results)
    }
  }
}

/**
 * Parse a QBO P&L by Class report into flat financial line items.
 */
export function parseProfitAndLossByClass(report: QboReport): ParsedFinancialLine[] {
  const classColumns = getClassColumns(report)
  const results: ParsedFinancialLine[] = []

  if (report.Rows?.Row) {
    walkRows(report.Rows.Row, classColumns, '', results)
  }

  return results
}

/**
 * Parse a standard QBO P&L report (not by class) into line items.
 */
export function parseProfitAndLoss(report: QboReport): ParsedFinancialLine[] {
  const results: ParsedFinancialLine[] = []

  function walk(rows: QboReportRow[], currentGroup: string) {
    for (const row of rows) {
      const group = row.group || currentGroup

      if (row.ColData && row.ColData.length >= 2) {
        const accountName = row.ColData[0]?.value
        const rawValue = row.ColData[1]?.value
        if (!accountName || !rawValue) continue

        const amount = parseFloat(rawValue.replace(/,/g, ''))
        if (isNaN(amount) || amount === 0) continue

        results.push({
          accountName,
          accountType: resolveAccountTypeStrict(group),
          amount: Math.abs(amount),
          className: null,
        })
      }

      if (row.Rows?.Row) {
        walk(row.Rows.Row, group)
      }
    }
  }

  if (report.Rows?.Row) {
    walk(report.Rows.Row, '')
  }

  return results
}

/**
 * Parse a QBO Balance Sheet report into line items.
 *
 * QBO nests sub-sections (e.g. "Bank Accounts" under "Assets").
 * If a child group doesn't resolve to a known balance sheet type,
 * we keep using the parent group so items are classified correctly.
 */
export function parseBalanceSheet(report: QboReport): ParsedFinancialLine[] {
  const results: ParsedFinancialLine[] = []

  function walk(rows: QboReportRow[], parentType: 'asset' | 'liability' | 'equity' | null) {
    for (const row of rows) {
      // If this row has its own group, try to resolve it
      const resolved = row.group ? resolveAccountType(row.group) : null
      // Use resolved type if it's a valid BS type, otherwise keep parent
      const effectiveType: 'asset' | 'liability' | 'equity' | null =
        resolved === 'asset' || resolved === 'liability' || resolved === 'equity'
          ? resolved
          : parentType

      if (row.ColData && row.ColData.length >= 2) {
        const accountName = row.ColData[0]?.value
        const rawValue = row.ColData[1]?.value
        if (!accountName || !rawValue) continue

        const amount = parseFloat(rawValue.replace(/,/g, ''))
        if (isNaN(amount) || amount === 0) continue

        // Skip summary/total rows (e.g. "Total Fixed Assets")
        if (accountName.toLowerCase().startsWith('total ')) continue

        results.push({
          accountName,
          accountType: effectiveType ?? 'asset',
          amount,
          className: null,
        })
      }

      if (row.Rows?.Row) {
        walk(row.Rows.Row, effectiveType)
      }
    }
  }

  if (report.Rows?.Row) {
    walk(report.Rows.Row, null)
  }

  return results
}
