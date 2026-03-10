'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Shield, Search, CheckCircle, AlertTriangle, User, Mail, Loader2, Plus, X } from 'lucide-react'

interface ConflictResult {
  hasConflict: boolean
  summary: string
  conflicts: Array<{
    type: string
    matched_name: string
    matter_id: string
    description: string
  }>
  checkedAt: string
}

export default function ConflictCheckPage() {
  const [form, setForm] = useState({
    clientName: '',
    clientEmail: '',
    adverseParties: [] as string[]
  })
  const [newParty, setNewParty] = useState('')
  const [result, setResult] = useState<ConflictResult | null>(null)
  const [loading, setLoading] = useState(false)

  const addParty = () => {
    if (!newParty.trim()) return
    setForm(prev => ({ ...prev, adverseParties: [...prev.adverseParties, newParty.trim()] }))
    setNewParty('')
  }

  const removeParty = (idx: number) => {
    setForm(prev => ({ ...prev, adverseParties: prev.adverseParties.filter((_, i) => i !== idx) }))
  }

  const runCheck = async () => {
    if (!form.clientName && !form.clientEmail) return
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/conflict-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden h-36">
        <Image
          src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=70"
          alt="Legal scales"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/75" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h2 className="text-2xl font-bold text-white">Conflict Check</h2>
          <p className="text-slate-300 text-sm mt-1">Check prospective clients against your existing matter database</p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
          <Shield className="h-5 w-5 text-indigo-600" />
          Client Information to Check
        </h3>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={form.clientName}
                onChange={e => setForm({ ...form, clientName: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="John Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Client Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                value={form.clientEmail}
                onChange={e => setForm({ ...form, clientEmail: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                placeholder="john@example.com"
              />
            </div>
          </div>
        </div>

        {/* Adverse parties */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Adverse Parties (optional)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newParty}
              onChange={e => setNewParty(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addParty()}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
              placeholder="Opposing party name"
            />
            <button
              onClick={addParty}
              className="flex items-center gap-1 px-3 py-2.5 bg-slate-100 text-slate-700 text-sm rounded-lg hover:bg-slate-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {form.adverseParties.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.adverseParties.map((party, idx) => (
                <div key={idx} className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm">
                  {party}
                  <button onClick={() => removeParty(idx)} className="text-slate-400 hover:text-slate-600 ml-1">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={runCheck}
          disabled={loading || (!form.clientName && !form.clientEmail)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          {loading ? 'Checking...' : 'Run Conflict Check'}
        </button>
      </div>

      {/* Result */}
      {result && (
        <div className={`bg-white rounded-xl border shadow-sm p-6 ${result.hasConflict ? 'border-red-300' : 'border-green-300'}`}>
          <div className={`flex items-start gap-4 ${result.hasConflict ? 'text-red-800' : 'text-green-800'}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${result.hasConflict ? 'bg-red-100' : 'bg-green-100'}`}>
              {result.hasConflict
                ? <AlertTriangle className="h-6 w-6" />
                : <CheckCircle className="h-6 w-6" />}
            </div>
            <div>
              <h3 className="font-bold text-lg">
                {result.hasConflict ? 'Potential Conflict Found' : 'No Conflicts Found'}
              </h3>
              <p className="text-sm opacity-80 mt-1">{result.summary}</p>
              <p className="text-xs opacity-60 mt-1">Checked at {new Date(result.checkedAt).toLocaleTimeString()}</p>
            </div>
          </div>

          {result.hasConflict && result.conflicts.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-slate-900 text-sm">Conflict Details:</h4>
              {result.conflicts.map((conflict, idx) => (
                <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0" />
                    <p className="font-medium text-red-800 text-sm">{conflict.matched_name}</p>
                    <span className="text-xs px-2 py-0.5 bg-red-200 text-red-800 rounded-full capitalize">
                      {conflict.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-red-700 text-xs">{conflict.description}</p>
                </div>
              ))}
              <p className="text-sm text-red-700 font-medium mt-2">
                ⚠ Review these conflicts carefully before accepting representation.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Info box */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
        <h4 className="font-semibold text-indigo-900 text-sm mb-2">How conflict checking works</h4>
        <ul className="space-y-1 text-indigo-800 text-xs">
          <li>• Checks client name against all existing clients and adverse parties</li>
          <li>• Checks client email for exact matches</li>
          <li>• Optionally checks adverse parties you add above</li>
          <li>• All new matters are automatically added to the conflict database</li>
        </ul>
      </div>
    </div>
  )
}
