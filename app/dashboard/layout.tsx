'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  Scale, LayoutDashboard, FileText, Users, Shield, 
  Settings, Menu, X, LogOut, ChevronRight, Bell, Plus
} from 'lucide-react'
import { useEffect } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/matters', label: 'Matters', icon: Users },
  { href: '/dashboard/intake', label: 'New Intake', icon: Plus },
  { href: '/dashboard/questionnaires', label: 'Questionnaires', icon: FileText },
  { href: '/dashboard/conflict-check', label: 'Conflict Check', icon: Shield },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Scale className="h-10 w-10 text-indigo-600 animate-pulse mx-auto mb-3" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 z-50 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <Link href="/dashboard" className="flex items-center gap-2 min-h-0 min-w-0">
            <Scale className="h-7 w-7 text-indigo-400" />
            <span className="text-white font-bold text-lg">LegalIntake</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative h-24 mx-4 mt-4 rounded-xl overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=600&q=60"
            alt="Law office"
            fill
            className="object-cover opacity-40"
          />
          <div className="absolute inset-0 flex flex-col justify-center px-3">
            <p className="text-white text-xs font-medium">{session.user.name}</p>
            <p className="text-slate-400 text-xs truncate">{session.user.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-600/80 text-indigo-200 text-xs rounded-full capitalize w-fit">
              {session.user.role}
            </span>
          </div>
        </div>

        <nav className="p-4 space-y-1 mt-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-0 min-w-0
                ${isActive(item) 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.label}
              {isActive(item) && <ChevronRight className="h-4 w-4 ml-auto" />}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-4">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-sm transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-600 hover:text-slate-900"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold text-slate-900">
              {navItems.find(i => isActive(i))?.label || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button className="relative p-2 text-slate-500 hover:text-slate-900">
              <Bell className="h-5 w-5" />
            </button>
            <Link href="/dashboard/intake" className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-0 min-w-0">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Intake</span>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
