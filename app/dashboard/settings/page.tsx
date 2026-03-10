'use client'

import { useSession } from 'next-auth/react'
import Image from 'next/image'
import { Settings, User, Building, Bell, Shield, CreditCard, ChevronRight } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="relative rounded-xl overflow-hidden h-32">
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=70"
          alt="Office settings"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/75" />
        <div className="absolute inset-0 flex flex-col justify-center px-6">
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-slate-300 text-sm mt-1">Manage your account and firm preferences</p>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-indigo-600" />
          Account Profile
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Name</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
              {session?.user?.name || '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Email</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900">
              {session?.user?.email || '—'}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase mb-1">Role</label>
            <div className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 capitalize">
              {session?.user?.role || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Settings nav items */}
      {[
        { icon: Building, label: 'Firm Settings', desc: 'Name, address, branding' },
        { icon: Bell, label: 'Notifications', desc: 'Email alerts and reminders' },
        { icon: Shield, label: 'Security', desc: 'Password and two-factor auth' },
        { icon: CreditCard, label: 'Billing', desc: 'Subscription and payment' },
      ].map((item) => (
        <button
          key={item.label}
          className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-left"
        >
          <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <item.icon className="h-5 w-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">{item.label}</p>
            <p className="text-slate-500 text-sm">{item.desc}</p>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 flex-shrink-0" />
        </button>
      ))}

      {/* Subscription */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-indigo-900 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan: LegalIntake Pro
            </h3>
            <p className="text-indigo-700 text-sm mt-1">$19/month — Active</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700">
            Manage Subscription
          </button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
          <Settings className="h-5 w-5 text-indigo-600" />
          About LegalIntake
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          LegalIntake helps solo and small law firms streamline client onboarding with 
          custom intake questionnaires, automated conflict checks, and engagement letter generation.
        </p>
        <p className="text-slate-400 text-xs mt-3">Version 1.0.0 • © 2026 LegalIntake</p>
      </div>
    </div>
  )
}
