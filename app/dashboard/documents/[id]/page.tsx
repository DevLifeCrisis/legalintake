'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, FileText, CheckCircle, Loader2, PenLine } from 'lucide-react'

interface Document {
  id: string
  matter_id: string
  name: string
  type: string
  file_content: string
  signed: boolean
  signed_at: string
  created_at: string
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [signing, setSigning] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [showSign, setShowSign] = useState(false)

  useEffect(() => {
    fetch(`/api/documents/${params.id}`)
      .then(r => r.json())
      .then(d => {
        setDocument(d.document)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const handleSign = async () => {
    if (!signatureName.trim()) return
    setSigning(true)
    try {
      await fetch(`/api/documents/${params.id}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureName })
      })
      router.refresh()
      setDocument(prev => prev ? { ...prev, signed: true, signed_at: new Date().toISOString() } : null)
      setShowSign(false)
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
      </div>
    )
  }

  if (!document) {
    return <div className="text-center py-20 text-slate-600">Document not found</div>
  }

  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/dashboard/matters/${document.matter_id}`} className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm min-h-0 min-w-0">
        <ArrowLeft className="h-4 w-4" />
        Back to Matter
      </Link>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="font-semibold text-slate-900">{document.name}</h2>
              <p className="text-slate-500 text-xs capitalize">{document.type.replace('_', ' ')}</p>
            </div>
          </div>
          <div>
            {document.signed ? (
              <div className="flex items-center gap-2 text-green-700 text-sm">
                <CheckCircle className="h-4 w-4" />
                Signed
              </div>
            ) : (
              <button
                onClick={() => setShowSign(true)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
              >
                <PenLine className="h-4 w-4" />
                Sign Document
              </button>
            )}
          </div>
        </div>

        {/* Document content */}
        <div className="p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-6 border border-slate-200">
            {document.file_content}
          </pre>
        </div>
      </div>

      {/* Signature modal */}
      {showSign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Sign Document</h3>
            <p className="text-slate-600 text-sm mb-4">
              By entering your name, you agree to sign this document electronically.
            </p>
            <input
              type="text"
              placeholder="Type your full legal name"
              value={signatureName}
              onChange={e => setSignatureName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSign(false)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSign}
                disabled={signing || !signatureName.trim()}
                className="flex-1 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : <PenLine className="h-4 w-4" />}
                {signing ? 'Signing...' : 'Sign Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
