/**
 * QuickBooks Online API response types.
 * QBO Reports use a nested Row/Column structure that requires careful parsing.
 */

// --- Class ---
export interface QboClass {
  Id: string
  Name: string
  FullyQualifiedName: string
  Active: boolean
  SubClass: boolean
}

export interface QboClassQueryResponse {
  QueryResponse: {
    Class?: QboClass[]
    startPosition: number
    maxResults: number
  }
}

// --- Report Types ---

export interface QboReportColumn {
  ColTitle: string
  ColType: string
  MetaData?: { Name: string; Value: string }[]
}

export interface QboReportHeader {
  Time: string
  ReportName: string
  ReportBasis: string
  StartPeriod: string
  EndPeriod: string
  Currency: string
  Option?: { Name: string; Value: string }[]
}

export interface QboReportColData {
  value: string
  id?: string
}

export interface QboReportRow {
  type: string
  group?: string
  Header?: { ColData: QboReportColData[] }
  Rows?: { Row: QboReportRow[] }
  ColData?: QboReportColData[]
  Summary?: { ColData: QboReportColData[] }
}

export interface QboReport {
  Header: QboReportHeader
  Columns: { Column: QboReportColumn[] }
  Rows: { Row: QboReportRow[] }
}

// --- Parsed Financial Data ---

export interface ParsedFinancialLine {
  accountName: string
  accountType: 'income' | 'expense' | 'other_income' | 'asset' | 'liability' | 'equity'
  amount: number
  className: string | null // null = unclassified / total column
}
