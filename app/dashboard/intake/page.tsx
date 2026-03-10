'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User, Mail, Phone, Scale, FileText, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface Questionnaire {
  id: string
  name: string
  practice_area: string
  fields: Field[]
}

interface Field {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
  conditional?: { field: string; value: string }
}

const PRACTICE_AREAS = [
  'Personal Injury', 'Family Law', 'Estate Planning', 'Criminal Defense',
  'Business Law', 'Immigration', 'Real Estate', 'Employment Law',
  'Bankruptcy', 'Intellectual Property', 'Other'
]

export default function IntakePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null)
  const [clientInfo, setClientInfo] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    practice_area: '',
    matter_description: '',
  })
  const [intakeAnswers, setIntakeAnswers] = useState<Record<string, string>>({})
  const [conflictResult, setConflictResult] = useState<{ hasConflict: boolean; summary: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/questionnaires')
      .then(r => r.json())
      .then(d => setQuestionnaires(d.questionnaires || []))
  }, [])

  useEffect(() => {
    if (clientInfo.practice_area) {
      const matching = questionnaires.find(q =>
        q.practice_area.toLowerCase() === clientInfo.practice_area.toLowerCase()
      )
      setSelectedQuestionnaire(matching || null)
    }
  }, [clientInfo.practice_area, questionnaires])

  const runConflictCheck = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/conflict-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: clientInfo.client_name,
          clientEmail: clientInfo.client_email,
        })
      })
      const data = await res.json()
      setConflictResult({ hasConflict: data.hasConflict, summary: data.summary })
    } catch {
      setConflictResult({ hasConflict: false, summary: 'Could not run conflict check' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...clientInfo,
          intake_data: intakeAnswers,
          questionnaire_id: selectedQuestionnaire?.id || null,
        })
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to create matter')
        setLoading(false)
        return
      }
      router.push(`/dashboard/matters/${data.matter.id}`)
    } catch {
      setError('Something went wrong')
      setLoading(false)
    }
  }

  const isFieldVisible = (field: Field) => {
    if (!field.conditional) return true
    return intakeAnswers[field.conditional.field] === field.conditional.value
  }

  const isStep1Valid = clientInfo.client_name && clientInfo.client_email && clientInfo.practice_area

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden h-36">
        <Image
          src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=70"
          alt="Intake form"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/75" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h2 className="text-2xl font-bold text-white">New Client Intake</h2>
          <p className="text-indigo-200 text-sm mt-1">Onboard a new client in minutes</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {['Client Info', 'Conflict Check', 'Questionnaire', 'Review'].map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 ${i === 0 ? 'hidden' : ''}`}>
              <div className={`h-0.5 ${step > i ? 'bg-indigo-600' : 'bg-slate-200'}`} />
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-medium ${step === i + 1 ? 'text-indigo-600' : step > i + 1 ? 'text-green-600' : 'text-slate-400'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                step > i + 1 ? 'bg-green-100 text-green-600' :
                step === i + 1 ? 'bg-indigo-600 text-white' :
                'bg-slate-100 text-slate-400'
              }`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className="hidden sm:inline">{s}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Step 1: Client Info */}
      {step === 1 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <User className="h-5 w-5 text-indigo-600" />
            Client Information
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={clientInfo.client_name}
                  onChange={e => setClientInfo({ ...clientInfo, client_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="Jane Smith"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={clientInfo.client_email}
                  onChange={e => setClientInfo({ ...clientInfo, client_email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="jane@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="tel"
                  value={clientInfo.client_phone}
                  onChange={e => setClientInfo({ ...clientInfo, client_phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                  placeholder="555-0100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Practice Area *</label>
              <div className="relative">
                <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  required
                  value={clientInfo.practice_area}
                  onChange={e => setClientInfo({ ...clientInfo, practice_area: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select area...</option>
                  {PRACTICE_AREAS.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Matter Description</label>
            <textarea
              value={clientInfo.matter_description}
              onChange={e => setClientInfo({ ...clientInfo, matter_description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Brief description of the client's legal matter..."
            />
          </div>

          {selectedQuestionnaire && (
            <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
              <FileText className="h-4 w-4 flex-shrink-0" />
              Questionnaire found: <strong>{selectedQuestionnaire.name}</strong>
            </div>
          )}

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Step 2: Conflict Check */}
      {step === 2 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <Scale className="h-5 w-5 text-indigo-600" />
            Conflict of Interest Check
          </h3>
          <p className="text-slate-600 text-sm">
            Before proceeding, we&apos;ll check <strong>{clientInfo.client_name}</strong> against your existing client database.
          </p>

          {!conflictResult ? (
            <button
              onClick={runConflictCheck}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Scale className="h-5 w-5" />}
              {loading ? 'Checking...' : 'Run Conflict Check'}
            </button>
          ) : (
            <div className={`p-4 rounded-xl border ${conflictResult.hasConflict ? 'bg-red-50 border-red-300' : 'bg-green-50 border-green-300'}`}>
              <div className={`flex items-start gap-3 ${conflictResult.hasConflict ? 'text-red-800' : 'text-green-800'}`}>
                {conflictResult.hasConflict
                  ? <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  : <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />}
                <div>
                  <p className="font-semibold">{conflictResult.hasConflict ? 'Potential Conflict Found' : 'No Conflicts Found'}</p>
                  <p className="text-sm mt-1 opacity-80">{conflictResult.summary}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
              Back
            </button>
            {conflictResult && (
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
              >
                {conflictResult.hasConflict ? 'Continue Anyway' : 'Continue'}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Questionnaire */}
      {step === 3 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-600" />
            {selectedQuestionnaire ? selectedQuestionnaire.name : 'Intake Questions'}
          </h3>

          {selectedQuestionnaire ? (
            <div className="space-y-4">
              {selectedQuestionnaire.fields.map(field => {
                if (!isFieldVisible(field)) return null
                return (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      {field.label}{field.required && ' *'}
                    </label>
                    {field.type === 'textarea' && (
                      <textarea
                        rows={3}
                        value={intakeAnswers[field.id] || ''}
                        onChange={e => setIntakeAnswers({ ...intakeAnswers, [field.id]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                    {field.type === 'select' && (
                      <select
                        value={intakeAnswers[field.id] || ''}
                        onChange={e => setIntakeAnswers({ ...intakeAnswers, [field.id]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                    {field.type === 'radio' && (
                      <div className="flex flex-wrap gap-3">
                        {field.options?.map(opt => (
                          <label key={opt} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name={field.id}
                              value={opt}
                              checked={intakeAnswers[field.id] === opt}
                              onChange={() => setIntakeAnswers({ ...intakeAnswers, [field.id]: opt })}
                              className="text-indigo-600"
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    )}
                    {['text', 'email', 'phone', 'number', 'date'].includes(field.type) && (
                      <input
                        type={field.type}
                        value={intakeAnswers[field.id] || ''}
                        onChange={e => setIntakeAnswers({ ...intakeAnswers, [field.id]: e.target.value })}
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      />
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
              No questionnaire configured for {clientInfo.practice_area}. You can add one in the Questionnaires section. Continue to create the matter.
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2"
            >
              Review <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Review & Submit */}
      {step === 4 && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-slate-900">Review & Create Matter</h3>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Client</p>
              <p className="font-medium text-slate-900">{clientInfo.client_name}</p>
              <p className="text-slate-600 text-sm">{clientInfo.client_email}</p>
              {clientInfo.client_phone && <p className="text-slate-600 text-sm">{clientInfo.client_phone}</p>}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-xs font-medium text-slate-500 uppercase mb-2">Matter</p>
              <p className="font-medium text-slate-900">{clientInfo.practice_area}</p>
              {clientInfo.matter_description && (
                <p className="text-slate-600 text-sm mt-1">{clientInfo.matter_description}</p>
              )}
            </div>

            {conflictResult && (
              <div className={`p-4 rounded-lg border ${conflictResult.hasConflict ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                <p className="text-xs font-medium uppercase mb-1 opacity-60">Conflict Check</p>
                <p className={`text-sm font-medium ${conflictResult.hasConflict ? 'text-red-800' : 'text-green-800'}`}>
                  {conflictResult.hasConflict ? '⚠ Conflict found' : '✓ No conflicts'}
                </p>
              </div>
            )}

            {Object.keys(intakeAnswers).length > 0 && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Questionnaire Answers</p>
                <p className="text-sm text-slate-600">{Object.keys(intakeAnswers).length} responses recorded</p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50">
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 flex-grow py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {loading ? 'Creating...' : 'Create Matter'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
