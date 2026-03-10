'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { FileText, Plus, Trash2, Edit3, ToggleLeft, ToggleRight, Loader2, GripVertical, X, ChevronDown, ChevronUp } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

interface Field {
  id: string
  label: string
  type: string
  required: boolean
  options?: string[]
  conditional?: { field: string; value: string }
}

interface Questionnaire {
  id: string
  name: string
  practice_area: string
  fields: Field[]
  is_active: boolean
  created_at: string
}

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Long Text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio / Yes-No' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'date', label: 'Date' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'number', label: 'Number' },
]

const PRACTICE_AREAS = [
  'Personal Injury', 'Family Law', 'Estate Planning', 'Criminal Defense',
  'Business Law', 'Immigration', 'Real Estate', 'Employment Law',
  'Bankruptcy', 'Intellectual Property', 'Other'
]

export default function QuestionnairesPage() {
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingQ, setEditingQ] = useState<Questionnaire | null>(null)
  const [form, setForm] = useState({ name: '', practice_area: '', fields: [] as Field[] })
  const [saving, setSaving] = useState(false)
  const [expandedField, setExpandedField] = useState<string | null>(null)

  useEffect(() => {
    loadQuestionnaires()
  }, [])

  const loadQuestionnaires = async () => {
    try {
      const res = await fetch('/api/questionnaires')
      const data = await res.json()
      setQuestionnaires(data.questionnaires || [])
    } finally {
      setLoading(false)
    }
  }

  const openBuilder = (q?: Questionnaire) => {
    if (q) {
      setEditingQ(q)
      setForm({ name: q.name, practice_area: q.practice_area, fields: q.fields })
    } else {
      setEditingQ(null)
      setForm({ name: '', practice_area: '', fields: [] })
    }
    setShowBuilder(true)
  }

  const addField = () => {
    const newField: Field = {
      id: uuidv4(),
      label: 'New Question',
      type: 'text',
      required: false,
    }
    setForm(prev => ({ ...prev, fields: [...prev.fields, newField] }))
    setExpandedField(newField.id)
  }

  const updateField = (id: string, updates: Partial<Field>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  }

  const removeField = (id: string) => {
    setForm(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }))
  }

  const saveQuestionnaire = async () => {
    setSaving(true)
    try {
      const url = editingQ ? `/api/questionnaires/${editingQ.id}` : '/api/questionnaires'
      const method = editingQ ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      if (res.ok) {
        setShowBuilder(false)
        loadQuestionnaires()
      }
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (q: Questionnaire) => {
    await fetch(`/api/questionnaires/${q.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...q, is_active: !q.is_active })
    })
    loadQuestionnaires()
  }

  const deleteQ = async (id: string) => {
    if (!confirm('Delete this questionnaire?')) return
    await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' })
    loadQuestionnaires()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden h-32">
        <Image
          src="https://images.unsplash.com/photo-1562564055-71e051d33c19?w=1200&q=70"
          alt="Form builder"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/75" />
        <div className="absolute inset-0 flex items-center justify-between px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Questionnaires</h2>
            <p className="text-indigo-200 text-sm mt-1">Build intake forms for each practice area</p>
          </div>
          <button
            onClick={() => openBuilder()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-700 font-semibold text-sm rounded-lg hover:bg-indigo-50"
          >
            <Plus className="h-4 w-4" />
            New Questionnaire
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : questionnaires.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-600">No questionnaires yet</p>
          <button onClick={() => openBuilder()} className="mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg inline-flex items-center gap-2">
            <Plus className="h-4 w-4" /> Create First Questionnaire
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {questionnaires.map(q => (
            <div key={q.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">{q.name}</h3>
                  <p className="text-slate-500 text-sm">{q.practice_area}</p>
                </div>
                <button onClick={() => toggleActive(q)} className="flex-shrink-0">
                  {q.is_active
                    ? <ToggleRight className="h-6 w-6 text-indigo-600" />
                    : <ToggleLeft className="h-6 w-6 text-slate-300" />}
                </button>
              </div>
              <p className="text-slate-400 text-xs mb-4">{q.fields.length} fields</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openBuilder(q)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg hover:bg-slate-50"
                >
                  <Edit3 className="h-3 w-3" /> Edit
                </button>
                <button
                  onClick={() => deleteQ(q.id)}
                  className="p-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Builder modal */}
      {showBuilder && (
        <div className="fixed inset-0 bg-black/50 z-50 overflow-y-auto">
          <div className="min-h-full flex items-start justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="font-bold text-slate-900 text-lg">
                  {editingQ ? 'Edit Questionnaire' : 'New Questionnaire'}
                </h3>
                <button onClick={() => setShowBuilder(false)} className="text-slate-400 hover:text-slate-900">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
                      placeholder="Personal Injury Intake"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Practice Area *</label>
                    <select
                      value={form.practice_area}
                      onChange={e => setForm({ ...form, practice_area: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                    >
                      <option value="">Select...</option>
                      {PRACTICE_AREAS.map(area => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-slate-900">Form Fields</h4>
                    <button
                      onClick={addField}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-lg hover:bg-indigo-200"
                    >
                      <Plus className="h-3 w-3" /> Add Field
                    </button>
                  </div>

                  {form.fields.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-slate-500 text-sm">No fields yet. Add your first question.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {form.fields.map((field, idx) => (
                        <div key={field.id} className="border border-slate-200 rounded-lg overflow-hidden">
                          <div
                            className="flex items-center gap-2 p-3 cursor-pointer hover:bg-slate-50"
                            onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                          >
                            <GripVertical className="h-4 w-4 text-slate-300 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{field.label}</p>
                              <p className="text-xs text-slate-400 capitalize">{field.type}{field.required ? ' · required' : ''}</p>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); removeField(field.id) }}
                              className="text-red-400 hover:text-red-600 p-1"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            {expandedField === field.id
                              ? <ChevronUp className="h-4 w-4 text-slate-400" />
                              : <ChevronDown className="h-4 w-4 text-slate-400" />}
                          </div>

                          {expandedField === field.id && (
                            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-3">
                              <div className="grid sm:grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Label</label>
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={e => updateField(field.id, { label: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
                                  <select
                                    value={field.type}
                                    onChange={e => updateField(field.id, { type: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 bg-white"
                                  >
                                    {FIELD_TYPES.map(t => (
                                      <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>

                              <label className="flex items-center gap-2 text-xs cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={e => updateField(field.id, { required: e.target.checked })}
                                  className="rounded text-indigo-600"
                                />
                                Required field
                              </label>

                              {['select', 'radio', 'checkbox'].includes(field.type) && (
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Options (one per line)</label>
                                  <textarea
                                    rows={3}
                                    value={(field.options || []).join('\n')}
                                    onChange={e => updateField(field.id, { options: e.target.value.split('\n').filter(Boolean) })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                                    placeholder="Yes&#10;No&#10;Maybe"
                                  />
                                </div>
                              )}

                              {idx > 0 && (
                                <div>
                                  <label className="block text-xs font-medium text-slate-600 mb-1">Show only if (conditional)</label>
                                  <div className="flex gap-2">
                                    <select
                                      value={field.conditional?.field || ''}
                                      onChange={e => updateField(field.id, {
                                        conditional: e.target.value ? { field: e.target.value, value: field.conditional?.value || '' } : undefined
                                      })}
                                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                                    >
                                      <option value="">No condition</option>
                                      {form.fields.slice(0, idx).map(f => (
                                        <option key={f.id} value={f.id}>{f.label}</option>
                                      ))}
                                    </select>
                                    {field.conditional?.field && (
                                      <input
                                        type="text"
                                        placeholder="equals..."
                                        value={field.conditional?.value || ''}
                                        onChange={e => updateField(field.id, {
                                          conditional: { field: field.conditional!.field, value: e.target.value }
                                        })}
                                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs"
                                      />
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-slate-100">
                <button onClick={() => setShowBuilder(false)} className="flex-1 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50">
                  Cancel
                </button>
                <button
                  onClick={saveQuestionnaire}
                  disabled={saving || !form.name || !form.practice_area}
                  className="flex-1 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {saving ? 'Saving...' : 'Save Questionnaire'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
