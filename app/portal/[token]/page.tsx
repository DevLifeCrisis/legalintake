'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import {
  Scale, FileText, Upload, CheckCircle, PenLine,
  AlertCircle, Loader2, X, File, CheckCircle2
} from 'lucide-react'

interface PortalData {
  matter: {
    id: string
    client_name: string
    practice_area: string
    status: string
    engagement_letter_sent: boolean
  }
  documents: Array<{
    id: string
    name: string
    type: string
    signed: boolean
    file_content: string
  }>
}

interface UploadedFile {
  id: string
  name: string
  status: 'uploading' | 'done' | 'error'
  errorMsg?: string
}

export default function ClientPortalPage() {
  const params = useParams()
  const token = params.token as string
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [data, setData] = useState<PortalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [signing, setSigning] = useState<string | null>(null)
  const [signatureName, setSignatureName] = useState('')
  const [showSignModal, setShowSignModal] = useState<string | null>(null)

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)

  useEffect(() => {
    fetch(`/api/portal/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Could not load portal'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSign = async (docId: string) => {
    if (!signatureName.trim()) return
    setSigning(docId)
    try {
      await fetch(`/api/documents/${docId}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signatureName })
      })
      setShowSignModal(null)
      const res = await fetch(`/api/portal/${token}`)
      const d = await res.json()
      setData(d)
    } finally {
      setSigning(null)
    }
  }

  const uploadFile = async (file: File) => {
    const tempId = `${Date.now()}_${file.name}`
    setUploadedFiles(prev => [...prev, { id: tempId, name: file.name, status: 'uploading' }])

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('token', token)
      if (data?.matter?.id) {
        formData.append('matter_id', data.matter.id)
      }

      const res = await fetch('/api/portal/upload', {
        method: 'POST',
        body: formData
      })

      const result = await res.json()

      if (!res.ok || result.error) {
        setUploadedFiles(prev =>
          prev.map(f => f.id === tempId ? { ...f, status: 'error', errorMsg: result.error || 'Upload failed' } : f)
        )
      } else {
        setUploadedFiles(prev =>
          prev.map(f => f.id === tempId ? { ...f, id: result.document?.id || tempId, status: 'done' } : f)
        )
      }
    } catch (err) {
      setUploadedFiles(prev =>
        prev.map(f => f.id === tempId ? { ...f, status: 'error', errorMsg: 'Network error — please try again' } : f)
      )
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    for (const file of files) {
      await uploadFile(file)
    }
    // Reset input so same file can be re-uploaded if needed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    for (const file of files) {
      await uploadFile(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const removeUpload = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Scale className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">Loading your portal...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Portal Unavailable</h2>
          <p className="text-slate-600">{error || 'This portal link is invalid or has expired.'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Scale className="h-7 w-7 text-indigo-600" />
          <div>
            <h1 className="font-bold text-slate-900">LegalIntake Client Portal</h1>
            <p className="text-slate-500 text-sm">Secure document center</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="relative rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1521791055366-0d553872952f?w=800&q=70"
            alt="Attorney and client"
            width={800}
            height={300}
            className="w-full object-cover h-40"
          />
          <div className="absolute inset-0 bg-indigo-900/70" />
          <div className="absolute inset-0 flex flex-col justify-center px-6">
            <p className="text-indigo-200 text-sm">Welcome,</p>
            <h2 className="text-2xl font-bold text-white">{data.matter.client_name}</h2>
            <p className="text-indigo-200 text-sm">{data.matter.practice_area} Matter</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-4">Your Intake Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Intake form submitted', done: true },
              { label: 'Conflict check completed', done: true },
              { label: 'Engagement letter ready', done: data.matter.engagement_letter_sent },
              { label: 'Document signing complete', done: data.documents.every(d => d.signed) },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className={`text-sm ${step.done ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {data.documents.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              Documents
            </h3>
            <div className="space-y-3">
              {data.documents.map(doc => (
                <div key={doc.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{doc.name}</p>
                        <p className={`text-xs ${doc.signed ? 'text-green-600' : 'text-amber-600'}`}>
                          {doc.signed ? '✓ Signed' : 'Awaiting your signature'}
                        </p>
                      </div>
                    </div>
                    {!doc.signed && (
                      <button
                        onClick={() => setShowSignModal(doc.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 min-h-[44px]"
                      >
                        <PenLine className="h-4 w-4" />
                        Sign
                      </button>
                    )}
                  </div>
                  {doc.file_content && (
                    <div className="mt-3 p-3 bg-slate-50 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 leading-relaxed">
                        {doc.file_content.substring(0, 500)}...
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Document Upload Section — fully wired */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Upload Documents
          </h3>
          <p className="text-slate-500 text-sm mb-4">Share any relevant documents with your attorney</p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
            multiple
            onChange={handleFileChange}
            className="sr-only"
            id="portal-file-upload"
            aria-label="Upload documents"
          />

          {/* Clickable dropzone */}
          <label
            htmlFor="portal-file-upload"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-300 hover:border-indigo-400 hover:bg-indigo-50'
            }`}
          >
            <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragOver ? 'text-indigo-500' : 'text-slate-400'}`} />
            <p className="text-slate-600 text-sm font-medium">Click to upload or drag and drop</p>
            <p className="text-slate-400 text-xs mt-1">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
          </label>

          {/* Upload status list */}
          {uploadedFiles.length > 0 && (
            <ul className="mt-4 space-y-2">
              {uploadedFiles.map(f => (
                <li
                  key={f.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
                >
                  {f.status === 'uploading' && (
                    <Loader2 className="h-4 w-4 text-indigo-500 animate-spin flex-shrink-0" />
                  )}
                  {f.status === 'done' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  )}
                  {f.status === 'error' && (
                    <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  )}
                  <File className="h-4 w-4 text-slate-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 truncate font-medium">{f.name}</p>
                    {f.status === 'uploading' && (
                      <p className="text-xs text-indigo-600">Uploading...</p>
                    )}
                    {f.status === 'done' && (
                      <p className="text-xs text-green-600">Uploaded successfully</p>
                    )}
                    {f.status === 'error' && (
                      <p className="text-xs text-red-600">{f.errorMsg || 'Upload failed'}</p>
                    )}
                  </div>
                  {f.status !== 'uploading' && (
                    <button
                      onClick={() => removeUpload(f.id)}
                      className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-slate-600 flex-shrink-0"
                      aria-label="Remove"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="text-center text-slate-400 text-xs pb-8">
          <Scale className="h-4 w-4 inline mr-1" />
          Powered by LegalIntake — Secure &amp; Confidential
        </div>
      </div>

      {showSignModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-slate-900 text-lg mb-2">Sign Document</h3>
            <p className="text-slate-600 text-sm mb-4">
              By typing your full legal name below, you are signing this document electronically.
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
                onClick={() => setShowSignModal(null)}
                className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSign(showSignModal)}
                disabled={!!signing || !signatureName.trim()}
                className="flex-1 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 min-h-[44px]"
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
