import Image from 'next/image'
import Link from 'next/link'
import { Scale, FileText, Shield, Users, CheckCircle, ArrowRight, Star, Clock, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-100 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Scale className="h-7 w-7 text-indigo-600" />
              <span className="text-xl font-bold text-slate-900">LegalIntake</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm text-slate-600 hover:text-slate-900 min-h-0 min-w-0">Features</Link>
              <Link href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 min-h-0 min-w-0">Pricing</Link>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 min-h-0 min-w-0">Sign In</Link>
              <Link href="/signup" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                Start Free Trial
              </Link>
            </div>
            <div className="md:hidden flex items-center gap-3">
              <Link href="/login" className="text-sm text-slate-600 min-h-0 min-w-0">Sign In</Link>
              <Link href="/signup" className="px-3 py-2 bg-indigo-600 text-white text-xs font-medium rounded-lg">
                Try Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-16 min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1800&q=80"
            alt="Law office with books and desk"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-600/20 border border-indigo-400/30 rounded-full text-indigo-300 text-sm mb-6">
              <Zap className="h-4 w-4" />
              Built for solo and small law firms
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Client Intake,
              <span className="text-indigo-400"> Done Right</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed">
              Replace email chains and PDF forms with a professional intake portal. 
              Automate conflict checks, generate engagement letters, and manage all client matters in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-lg">
                Start Free Trial
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl hover:bg-white/20 transition-colors border border-white/20 text-lg">
                Sign In
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> 14-day free trial</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> $19/mo after trial</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" /> Cancel anytime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-indigo-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2 hrs', label: 'Saved per new client' },
              { value: '100%', label: 'Conflict check coverage' },
              { value: '< 5 min', label: 'Client onboarding time' },
              { value: '$19/mo', label: 'Flat monthly price' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-indigo-200 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Onboard Clients Professionally
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              From first contact to signed engagement letter — automated, organized, and compliant.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileText,
                title: 'Custom Intake Questionnaires',
                description: 'Build practice area-specific intake forms with conditional logic. Clients complete them online — no PDFs, no printing.',
                image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
                alt: 'Form on tablet'
              },
              {
                icon: Shield,
                title: 'Automated Conflict Checks',
                description: 'Instantly check new clients against your existing matter database. Never miss a conflict of interest again.',
                image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
                alt: 'Legal scales of justice'
              },
              {
                icon: Scale,
                title: 'Engagement Letter Generation',
                description: 'Auto-generate engagement letters from intake data. Send for e-signature in seconds.',
                image: 'https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=600&q=80',
                alt: 'Legal documents'
              },
              {
                icon: Users,
                title: 'Client Portal',
                description: 'Give clients a secure portal to upload documents and sign agreements — no account needed.',
                image: 'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&q=80',
                alt: 'Client using laptop'
              },
              {
                icon: Clock,
                title: 'Matter Dashboard',
                description: 'CRM-style dashboard with all client and matter data organized and searchable.',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
                alt: 'Dashboard analytics'
              },
              {
                icon: Zap,
                title: 'Instant Setup',
                description: 'Get started in minutes. Pre-built templates for common practice areas included.',
                image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
                alt: 'Attorney at desk'
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="relative h-48">
                  <Image
                    src={feature.image}
                    alt={feature.alt}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/80 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">
                From First Contact to Signed Agreement in Minutes
              </h2>
              <div className="space-y-6">
                {[
                  { step: '01', title: 'Client fills out intake form', desc: 'Send a personalized link. Client completes your custom questionnaire from any device.' },
                  { step: '02', title: 'Conflict check runs automatically', desc: 'System checks new client against all existing clients and adverse parties instantly.' },
                  { step: '03', title: 'Engagement letter generated', desc: 'One click to generate a pre-filled engagement letter ready for e-signature.' },
                  { step: '04', title: 'Matter created in dashboard', desc: 'All intake data, documents, and status organized in your matter dashboard.' },
                ].map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                      {item.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{item.title}</h4>
                      <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1521791055366-0d553872952f?w=800&q=80"
                alt="Attorney reviewing documents"
                width={600}
                height={500}
                className="rounded-2xl shadow-2xl w-full object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 max-w-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">No Conflicts Found</p>
                    <p className="text-slate-500 text-xs">Jane Smith — Personal Injury</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Loved by Solo Attorneys</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: "I used to spend 2 hours on every new client intake. Now it takes 10 minutes, including the engagement letter. This is exactly what solo practitioners need.",
                name: "Sarah M.",
                title: "Solo Attorney, Family Law",
                avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&q=80"
              },
              {
                quote: "The conflict check alone is worth the price. I was keeping a spreadsheet that I never updated. Now I know instantly if there's a conflict.",
                name: "James K.",
                title: "Personal Injury Attorney",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80"
              },
              {
                quote: "My clients love the portal. They can upload documents and sign the engagement letter from their phone. Very professional.",
                name: "Maria L.",
                title: "Estate Planning Attorney",
                avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80"
              }
            ].map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-amber-400 fill-current" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-lg text-slate-600">One plan. Everything included. No hidden fees.</p>
          </div>
          <div className="max-w-md mx-auto">
            <div className="bg-indigo-600 rounded-3xl p-8 text-white text-center">
              <div className="text-sm font-medium text-indigo-200 mb-2">LegalIntake Pro</div>
              <div className="text-5xl font-bold mb-2">$19</div>
              <div className="text-indigo-200 mb-8">per month, billed monthly</div>
              <ul className="text-left space-y-4 mb-8">
                {[
                  'Unlimited intake questionnaires',
                  'Automated conflict checking',
                  'Client portal with document upload',
                  'Engagement letter generation',
                  'Matter dashboard & CRM',
                  'E-signature on all documents',
                  'Up to 50 active matters',
                  'Email support',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle className="h-5 w-5 text-indigo-300 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block w-full py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors text-center">
                Start 14-Day Free Trial
              </Link>
              <p className="text-indigo-300 text-xs mt-3">Cancel anytime. Full access during trial.</p>
            </div>
            <div className="mt-6 p-4 bg-slate-50 rounded-xl text-center text-sm text-slate-600">
              <strong>Need more storage?</strong> Add unlimited document storage for $9/mo additional.
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1800&q=80"
            alt="Attorney at work"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-indigo-900/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Stop Losing Time on Client Intake
          </h2>
          <p className="text-xl text-indigo-200 mb-8">
            Join hundreds of solo attorneys who&apos;ve replaced their intake chaos with LegalIntake.
          </p>
          <Link href="/signup" className="inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-lg">
            Start Your Free Trial
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Scale className="h-6 w-6 text-indigo-400" />
              <span className="text-white font-bold">LegalIntake</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <Link href="/login" className="hover:text-white min-h-0 min-w-0">Sign In</Link>
              <Link href="/signup" className="hover:text-white min-h-0 min-w-0">Sign Up</Link>
              <Link href="#features" className="hover:text-white min-h-0 min-w-0">Features</Link>
              <Link href="#pricing" className="hover:text-white min-h-0 min-w-0">Pricing</Link>
            </div>
            <p className="text-slate-500 text-sm">© 2026 LegalIntake. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
