'use client'

import { FileDown } from 'lucide-react'

export default function DownloadPdfButton() {
  function handleDownload() {
    window.print()
  }

  return (
    <button
      onClick={handleDownload}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors print:hidden"
    >
      <FileDown className="h-3.5 w-3.5" />
      Download PDF
    </button>
  )
}
