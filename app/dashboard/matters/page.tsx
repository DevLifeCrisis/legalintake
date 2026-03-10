'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, Search, Filter, ArrowRight, CheckCircle, AlertTriangle, Clock, Plus } from 'lucide-react'

interface Matter {
  id: string
  client_name: string
  client_email: string
  client_phone: string
  practice_area: string
  status: string
  conflict_checked: boolean
  conflict_result: string
  engagement_letter_signed: boolean
  created_at: string
  matter_description: string
}

const statusColors: Record<string, string> = {
  intake: 'bg-amber-100 text-amber-800',
  active: 'bg-green-100 text-green-800',
  closed: 'bg-slate-100 text-slate-600',
  conflict: 'bg-red-100 text-red-800',
}

export default function MattersPage() {
  const [matters, setMatters] = useState<Matter[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetch('/api/matters')
      .then(r => r.json())
      .then(d => {
        setMatters(d.matters || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filtered = matters.filter(m => {
    const matchSearch = !search ||
      m.client_name.toLowerCase().includes(search.toLowerCase()) ||
      m.client_email.toLowerCase().includes(search.toLowerCase()) ||
      m.practice_area.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || m.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      {/* Header image */}
      <div className="relative rounded-xl overflow-hidden h-32 sm:h-40">
        <Image
          src="https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=70"
          alt="Law firm office"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/70" />
        <div className="absolute inset-0 flex items-center px-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Matters</h2>
            <p className="text-slate-300 text-sm mt-1">{matters.length} total matters</p>
          </div>
          <Link
            href="/dashboard/intake"
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-0 min-w-0"
          >
            <Plus className="h-4 w-4" />
            New Intake
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, or practice area..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="intake">Intake</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="conflict">Conflict</option>
          </select>
        </div>
      </div>

      {/* Matters list */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse text-slate-300" />
            Loading matters...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">No matters found</p>
            {search || statusFilter !== 'all' ? (
              <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
            ) : (
              <Link href="/dashboard/intake" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg min-h-0 min-w-0">
                <Plus className="h-4 w-4" /> New Intake
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Practice Area</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Conflict</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase">Date</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((matter) => (
                    <tr key={matter.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900 text-sm">{matter.client_name}</p>
                        <p className="text-slate-500 text-xs">{matter.client_email}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{matter.practice_area}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[matter.status]}`}>
                          {matter.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {!matter.conflict_checked ? (
                          <span className="text-slate-400 text-xs">Not checked</span>
                        ) : matter.conflict_result === 'conflict' ? (
                          <div className="flex items-center gap-1 text-red-600 text-xs">
                            <AlertTriangle className="h-3 w-3" /> Conflict
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-green-600 text-xs">
                            <CheckCircle className="h-3 w-3" /> Clear
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(matter.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/matters/${matter.id}`} className="flex items-center gap-1 text-indigo-600 text-sm hover:text-indigo-700 min-h-0 min-w-0">
                          View <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-slate-100">
              {filtered.map((matter) => (
                <Link
                  key={matter.id}
                  href={`/dashboard/matters/${matter.id}`}
                  className="flex items-center gap-3 p-4 hover:bg-slate-50 min-h-0 min-w-0"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-slate-900 text-sm">{matter.client_name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[matter.status]}`}>
                        {matter.status}
                      </span>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{matter.practice_area}</p>
                    <p className="text-slate-400 text-xs">{new Date(matter.created_at).toLocaleDateString()}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
