import DealAnalyzerForm from '@/components/dashboard/DealAnalyzerForm'

export default function DealAnalyzerPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Deal Analyzer</h1>
        <p className="text-sm text-gray-500 mt-1">Evaluate a new acquisition against your portfolio baseline</p>
      </div>
      <DealAnalyzerForm />
    </div>
  )
}
