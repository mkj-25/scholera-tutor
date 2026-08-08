import { useState, useCallback } from 'react'
import { Eye, EyeOff, ArrowRight, Sparkles, BookOpen, Brain, ChevronRight } from 'lucide-react'

/**
 * AuthScreen — polished frontend demo authentication landing screen.
 *
 * Shows a branded landing page with Login/Signup forms.
 * No real backend — credentials are accepted if non-empty.
 * On success, calls onAuth(email, name) to enter the app.
 */
export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('landing') // 'landing' | 'login' | 'signup'

  if (mode === 'login') {
    return (
      <AuthLayout>
        <LoginForm onAuth={onAuth} onBack={() => setMode('landing')} onSwitchToSignup={() => setMode('signup')} />
      </AuthLayout>
    )
  }

  if (mode === 'signup') {
    return (
      <AuthLayout>
        <SignupForm onAuth={onAuth} onBack={() => setMode('landing')} onSwitchToLogin={() => setMode('login')} />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <LandingContent onLogin={() => setMode('login')} onSignup={() => setMode('signup')} />
    </AuthLayout>
  )
}

/** Outer layout wrapper with background shapes */
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden"
         style={{ backgroundColor: '#f5f7fa' }}>
      
      {/* Subtle background decoration */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient blob top-right */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-[0.07]"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />
        {/* Gradient blob bottom-left */}
        <div
          className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #20b8c5 0%, transparent 70%)' }}
        />
        {/* Dot grid */}
        <div className="absolute inset-0 bg-dot-grid opacity-60" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

/** Landing content — branding + CTA buttons */
function LandingContent({ onLogin, onSignup }) {
  return (
    <div>
      {/* Card */}
      <div
        className="rounded-2xl border p-8 sm:p-10"
        style={{
          backgroundColor: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderColor: 'rgba(226,232,240,0.8)',
          boxShadow: '0 8px 40px rgba(16,24,40,0.08), 0 1px 3px rgba(16,24,40,0.04)',
        }}
      >
        {/* Logo + wordmark */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
            style={{
              backgroundColor: '#2563eb',
              boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
            }}
          >
            S
          </div>
          <div>
            <div className="font-semibold text-[#101828] leading-none">Scholera</div>
            <div className="text-[11px] text-[#98a2b3] mt-0.5">AI Course Assistant</div>
          </div>
        </div>

        {/* Heading */}
        <h1
          className="text-3xl sm:text-4xl font-semibold tracking-tight leading-[1.1] mb-3"
          style={{ fontFamily: 'var(--font-serif)', color: '#101828' }}
        >
          Learn deeper,<br />
          <span style={{ color: '#2563eb' }}>faster.</span>
        </h1>

        <p className="text-sm leading-relaxed mb-8" style={{ color: '#667085' }}>
          An AI-powered course tutor that grounds every answer in your professor's
          lecture material. Ask questions, explore slides, save concepts.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { icon: Sparkles, label: 'AI-grounded answers' },
            { icon: BookOpen, label: 'Lecture citations' },
            { icon: Brain, label: 'Save concepts' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
            >
              <Icon size={12} />
              {label}
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="space-y-3">
          <button
            id="auth-signup-btn"
            onClick={onSignup}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm
                       text-white transition-all duration-200 hover:opacity-90 hover:-translate-y-[1px]
                       active:translate-y-0"
            style={{
              backgroundColor: '#2563eb',
              boxShadow: '0 4px 14px rgba(37,99,235,0.28)',
            }}
          >
            Get started
            <ArrowRight size={16} />
          </button>

          <button
            id="auth-login-btn"
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm
                       transition-all duration-200 border hover:bg-[#f8fafc] hover:-translate-y-[1px]
                       active:translate-y-0"
            style={{
              color: '#344054',
              borderColor: '#e2e8f0',
              backgroundColor: 'white',
            }}
          >
            Log in to Scholera
          </button>
        </div>

        {/* Course chip */}
        <div
          className="mt-6 flex items-center gap-2 p-3 rounded-xl border text-xs"
          style={{ borderColor: '#e2e8f0', backgroundColor: '#f8fafc', color: '#667085' }}
        >
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
            style={{ backgroundColor: '#2563eb' }}
          >
            ML
          </div>
          <div>
            <div className="font-medium text-[#344054]">CS 4780 · Machine Learning for Engineers</div>
            <div>Dr. Elena Márquez · 3 weeks · 37 slides</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-[11px] mt-5" style={{ color: '#98a2b3' }}>
        Demo application · No real data is stored
      </p>
    </div>
  )
}

/** Shared form input */
function FormInput({ id, label, type = 'text', value, onChange, placeholder, required }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium mb-1.5"
        style={{ color: '#344054' }}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={isPassword ? 'current-password' : 'email'}
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm
                     outline-none transition-all duration-200
                     placeholder:text-[#98a2b3]"
          style={{
            borderColor: '#e2e8f0',
            backgroundColor: 'white',
            color: '#101828',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#2563eb'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5"
            style={{ color: '#98a2b3' }}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  )
}

/** Card wrapper for login/signup forms */
function FormCard({ children }) {
  return (
    <div
      className="rounded-2xl border p-7 sm:p-9"
      style={{
        backgroundColor: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(226,232,240,0.8)',
        boxShadow: '0 8px 40px rgba(16,24,40,0.08), 0 1px 3px rgba(16,24,40,0.04)',
      }}
    >
      {children}
    </div>
  )
}

/** Form header */
function FormHeader({ title, subtitle }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ backgroundColor: '#2563eb' }}
        >
          S
        </div>
        <span className="font-semibold text-sm" style={{ color: '#101828' }}>Scholera</span>
      </div>
      <h1 className="text-2xl font-semibold mb-1.5 tracking-tight" style={{ color: '#101828' }}>
        {title}
      </h1>
      <p className="text-sm" style={{ color: '#667085' }}>{subtitle}</p>
    </div>
  )
}

/** Login form */
function LoginForm({ onAuth, onBack, onSwitchToSignup }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setError('')
    setLoading(true)
    // Simulate auth delay
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    onAuth(email.trim(), null)
  }, [email, password, onAuth])

  return (
    <FormCard>
      <FormHeader
        title="Welcome back"
        subtitle="Log in to continue with Scholera Tutor."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="login-email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@university.edu"
          required
        />
        <FormInput
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter your password"
          required
        />

        {error && (
          <p className="text-xs rounded-lg px-3 py-2 border"
             style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', backgroundColor: '#fef2f2' }}>
            {error}
          </p>
        )}

        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                     font-medium text-sm text-white transition-all duration-200
                     hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#2563eb',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
          }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Log in
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <span className="text-xs" style={{ color: '#98a2b3' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToSignup}
            className="font-medium hover:underline"
            style={{ color: '#2563eb' }}
          >
            Sign up
          </button>
        </span>
      </div>

      <button
        onClick={onBack}
        className="mt-4 flex items-center gap-1 text-xs mx-auto hover:underline"
        style={{ color: '#98a2b3' }}
      >
        ← Back
      </button>
    </FormCard>
  )
}

/** Signup form */
function SignupForm({ onAuth, onBack, onSwitchToLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setLoading(false)
    onAuth(email.trim(), name.trim())
  }, [name, email, password, onAuth])

  return (
    <FormCard>
      <FormHeader
        title="Create your account"
        subtitle="Join Scholera and start learning with AI."
      />

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="signup-name"
          label="Full name"
          type="text"
          value={name}
          onChange={setName}
          placeholder="Ana Reyes"
          required
        />
        <FormInput
          id="signup-email"
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@university.edu"
          required
        />
        <FormInput
          id="signup-password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="At least 6 characters"
          required
        />

        {error && (
          <p className="text-xs rounded-lg px-3 py-2 border"
             style={{ color: '#dc2626', borderColor: 'rgba(220,38,38,0.2)', backgroundColor: '#fef2f2' }}>
            {error}
          </p>
        )}

        <button
          id="signup-submit"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl
                     font-medium text-sm text-white transition-all duration-200
                     hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#2563eb',
            boxShadow: '0 4px 14px rgba(37,99,235,0.25)',
          }}
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <span className="text-xs" style={{ color: '#98a2b3' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium hover:underline"
            style={{ color: '#2563eb' }}
          >
            Log in
          </button>
        </span>
      </div>

      <button
        onClick={onBack}
        className="mt-4 flex items-center gap-1 text-xs mx-auto hover:underline"
        style={{ color: '#98a2b3' }}
      >
        ← Back
      </button>
    </FormCard>
  )
}
