'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft, User, Mail, Phone, Scale, CheckCircle, AlertTriangle,
  FileText, Shield, Send, Loader2, ExternalLink, Clock, Plus
} from 'lucide-react'

interface Matter {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  practice_area: string
  matter_description: string
  status: string
  intake_data: Record<string, string>
  conflict_checked: boolean
  conflict_result: string
  engagement_letter_sent: boolean
  engagement_letter_signed: boolean
  created_at: string
}

interface Document {
  id: string
  name: string
  type: string
  signed: boolean
  signed_at: string
  created_at: string
  file_content: string
}

export default function MatterDetailPage() {
  const params = useParams()
  const matterId = params.id as string
  const [matter, setMatter] = useState<Matter | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [conflictLoading, setConflictLoading] = useState(false)
  const [letterLoading, setLetterLoading] = useState(false)
  const [portalToken, setPortalToken] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadMatter()
  }, [matterId])

  const loadMatter = async () => {
    try {
      const res = await fetch(`/api/matters/${matterId}`)
      const data = await res.json()
      setMatter(data.matter)
      setDocuments(data.documents || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const runConflictCheck = async () => {
    if (!matter) return
    setConflictLoading(true)
    try {
      const res = await fetch('/api/conflict-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: matter.client_name,
          clientEmail: matter.client_email,
        })
      })
      const data = await res.json()
      const conflictResult = data.hasConflict ? 'conflict' : 'clear'
      await fetch(`/api/matters/${matterId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conflict_checked: true, conflict_result: conflictResult })
      })
      setMatter(prev => prev ? { ...prev, conflict_checked: true, conflict_result: conflictResult } : null)
      setMessage(data.summary)
    } finally {
      setConflictLoading(false)
    }
  }

  const generateLetter = async () => {
    setLetterLoading(true)
    try {
      const res = await fetch('/api/engagement-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matterId })
      })
      if (res.ok) {
        setMessage('Engagement letter generated successfully')
        loadMatter()
      }
    } finally {
      setLetterLoading(false)
    }
  }

  const generatePortalLink = async () => {
    const res = await fetch('/api/portal/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matterId })
    })
    const data = await res.json()
    setPortalToken(`${window.location.origin}${data.portalUrl}`)
  }

  const statusColors: Record<string, string> = {
    intake: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-600',
    conflict: 'bg-red-100 text-red-800',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!matter) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600">Matter not found</p>
        <Link href="/dashboard/matters" className="text-indigo-600 text-sm mt-2 inline-block min-h-0 min-w-0">← Back to matters</Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back */}
      <Link href="/dashboard/matters" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm min-h-0 min-w-0">
        <ArrowLeft className="h-4 w-4" />
        Back to Matters
      </Link>

      {/* Header */}
      <div className="relative rounded-xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=1200&q=70"
            alt="Legal documents"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-slate-900/80" />
        </div>
        <div className="relative p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h2 className="text-2xl font-bold text-white">{matter.client_name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[matter.status]}`}>
                  {matter.status}
                </span>
              </div>
              <p className="text-slate-300 text-sm">{matter.practice_area}</p>
              <p className="text-slate-400 text-xs mt-1">
                Created {new Date(matter.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 border border-blue-200 text-blue-800 rounded-lg text-sm">
          {message}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Client info */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Client Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">Name:</span>
                <span className="font-medium text-slate-900">{matter.client_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">Email:</span>
                <a href={`mailto:${matter.client_email}`} className="font-medium text-indigo-600 hover:text-indigo-700 min-h-0 min-w-0">{matter.client_email}</a>
              </div>
              {matter.client_phone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <span className="text-slate-600">Phone:</span>
                  <span className="font-medium text-slate-900">{matter.client_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Scale className="h-4 w-4 text-slate-400 flex-shrink-0" />
                <span className="text-slate-600">Practice Area:</span>
                <span className="font-medium text-slate-900">{matter.practice_area}</span>
              </div>
              {matter.matter_description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-sm text-slate-600 font-medium mb-1">Matter Description:</p>
                  <p className="text-sm text-slate-700">{matter.matter_description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Intake data */}
          {matter.intake_data && Object.keys(matter.intake_data).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-600" />
                Intake Questionnaire Responses
              </h3>
              <div className="space-y-3">
                {Object.entries(matter.intake_data).map(([key, value]) => (
                  <div key={key} className="border-b border-slate-50 pb-3 last:border-0 last:pb-0">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{key}</p>
                    <p className="text-sm text-slate-900 mt-0.5">{value as string}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Documents
            </h3>
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm">No documents yet. Generate an engagement letter below.</p>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between gap-4 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="h-4 w-4 text-indigo-600 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">{doc.name}</p>
                        <p className="text-xs text-slate-500">
                          {doc.signed ? `Signed ${new Date(doc.signed_at).toLocaleDateString()}` : 'Not signed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {doc.signed ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-amber-500" />
                      )}
                      <Link
                        href={`/dashboard/documents/${doc.id}`}
                        className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 min-h-0 min-w-0"
                      >
                        View <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Actions */}
        <div className="space-y-4">
          {/* Conflict check */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              Conflict Check
            </h3>
            {matter.conflict_checked ? (
              <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                matter.conflict_result === 'conflict'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {matter.conflict_result === 'conflict'
                  ? <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  : <CheckCircle className="h-4 w-4 flex-shrink-0" />}
                {matter.conflict_result === 'conflict' ? 'Conflict found!' : 'No conflicts found'}
              </div>
            ) : (
              <button
                onClick={runConflictCheck}
                disabled={conflictLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {conflictLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                {conflictLoading ? 'Checking...' : 'Run Conflict Check'}
              </button>
            )}
          </div>

          {/* Engagement letter */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Engagement Letter
            </h3>
            {matter.engagement_letter_signed ? (
              <div className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Letter signed by client
              </div>
            ) : matter.engagement_letter_sent ? (
              <div className="text-amber-700 text-sm bg-amber-50 p-3 rounded-lg border border-amber-200">
                <Clock className="h-4 w-4 inline mr-2" />
                Awaiting client signature
              </div>
            ) : (
              <button
                onClick={generateLetter}
                disabled={letterLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {letterLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                {letterLoading ? 'Generating...' : 'Generate Letter'}
              </button>
            )}
          </div>

          {/* Client portal */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Send className="h-5 w-5 text-indigo-600" />
              Client Portal
            </h3>
            {portalToken ? (
              <div>
                <p className="text-xs text-slate-600 mb-2">Share this link with your client:</p>
                <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-700 break-all border border-slate-200">
                  {portalToken}
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(portalToken)}
                  className="w-full mt-2 py-2 text-indigo-600 text-sm font-medium border border-indigo-200 rounded-lg hover:bg-indigo-50"
                >
                  Copy Link
                </button>
              </div>
            ) : (
              <button
                onClick={generatePortalLink}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200"
              >
                <Plus className="h-4 w-4" />
                Generate Portal Link
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
