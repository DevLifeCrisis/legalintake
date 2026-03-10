'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'
import { Users, FileText, Shield, CheckCircle, Clock, AlertTriangle, ArrowRight, TrendingUp, Plus } from 'lucide-react'

interface Matter {
  id: string
  client_name: string
  client_email: string
  practice_area: string
  status: string
  conflict_checked: boolean
  conflict_result: string
  engagement_letter_signed: boolean
  created_at: string
}

interface Stats {
  total: number
  intake: number
  active: number
  conflictsFound: number
  signedEngagements: number
}

export default function DashboardPage() {
  const { data: session } = useSession()
  const [matters, setMatters] = useState<Matter[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, intake: 0, active: 0, conflictsFound: 0, signedEngagements: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [session])

  const loadDashboard = async () => {
    try {
      const res = await fetch('/api/matters')
      const data = await res.json()
      const allMatters: Matter[] = data.matters || []
      setMatters(allMatters.slice(0, 5))
      setStats({
        total: allMatters.length,
        intake: allMatters.filter(m => m.status === 'intake').length,
        active: allMatters.filter(m => m.status === 'active').length,
        conflictsFound: allMatters.filter(m => m.conflict_result === 'conflict').length,
        signedEngagements: allMatters.filter(m => m.engagement_letter_signed).length,
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const statusColors: Record<string, string> = {
    intake: 'bg-amber-100 text-amber-800',
    active: 'bg-green-100 text-green-800',
    closed: 'bg-slate-100 text-slate-600',
    conflict: 'bg-red-100 text-red-800',
  }

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=70"
            alt="Attorney at desk"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-indigo-900/60" />
        </div>
        <div className="relative p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-white mb-1">
            Good morning, {session?.user?.name?.split(' ')[0]}
          </h2>
          <p className="text-indigo-200 mb-4">Here&apos;s your firm&apos;s intake overview</p>
          <Link href="/dashboard/intake" className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 transition-colors text-sm min-h-0 min-w-0">
            <Plus className="h-4 w-4" />
            Start New Intake
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Matters', value: stats.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'In Intake', value: stats.intake, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Active Matters', value: stats.active, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Signed Letters', value: stats.signedEngagements, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {loading ? '—' : stat.value}
            </div>
            <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: '/dashboard/intake', label: 'New Client Intake', desc: 'Start onboarding a new client', icon: Plus, color: 'bg-indigo-600' },
          { href: '/dashboard/conflict-check', label: 'Run Conflict Check', desc: 'Check a new client for conflicts', icon: Shield, color: 'bg-emerald-600' },
          { href: '/dashboard/questionnaires', label: 'Manage Questionnaires', desc: 'Build custom intake forms', icon: FileText, color: 'bg-purple-600' },
        ].map((action) => (
          <Link key={action.href} href={action.href} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow min-h-0 min-w-0">
            <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <action.icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-semibold text-slate-900 text-sm">{action.label}</p>
              <p className="text-slate-500 text-xs">{action.desc}</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-400 ml-auto flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Recent matters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Matters</h3>
          <Link href="/dashboard/matters" className="text-indigo-600 text-sm font-medium hover:text-indigo-700 flex items-center gap-1 min-h-0 min-w-0">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-500">
            <Clock className="h-8 w-8 mx-auto mb-2 animate-pulse text-slate-300" />
            Loading matters...
          </div>
        ) : matters.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-600 font-medium">No matters yet</p>
            <p className="text-slate-400 text-sm mt-1">Start a new client intake to get going</p>
            <Link href="/dashboard/intake" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg min-h-0 min-w-0">
              <Plus className="h-4 w-4" />
              New Intake
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {matters.map((matter) => (
              <Link
                key={matter.id}
                href={`/dashboard/matters/${matter.id}`}
                className="flex items-center gap-4 p-4 sm:px-6 hover:bg-slate-50 transition-colors min-h-0 min-w-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-slate-900 text-sm truncate">{matter.client_name}</p>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[matter.status] || 'bg-slate-100 text-slate-600'}`}>
                      {matter.status}
                    </span>
                    {matter.conflict_result === 'conflict' && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-slate-500 text-xs mt-0.5">{matter.practice_area}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-slate-400">
                    {new Date(matter.created_at).toLocaleDateString()}
                  </p>
                  {matter.engagement_letter_signed && (
                    <div className="flex items-center gap-1 text-green-600 text-xs mt-0.5">
                      <CheckCircle className="h-3 w-3" />
                      Signed
                    </div>
                  )}
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
