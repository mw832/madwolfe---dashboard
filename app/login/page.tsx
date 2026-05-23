'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    window.location.href = '/dashboard'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(120,100,140,0.08) 0%, transparent 70%)' }} />
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(184,184,200,0.08)', border: '0.5px solid rgba(184,184,200,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#b8b8c8', fontWeight: 500 }}>MW</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 500, color: '#b8b8c8', letterSpacing: '0.02em' }}>MadWolfe Productions</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Internal Dashboard</div>
            </div>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px' }}>
          <div style={{ fontSize: 18, fontWeight: 500, color: 'rgba(255,255,255,0.88)', marginBottom: 4 }}>Sign in</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginBottom: 28 }}>Use the credentials you were invited with</div>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@madwolfe.com" required style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.88)', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
            <div>
              <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.12)', borderRadius: 8, color: 'rgba(255,255,255,0.88)', padding: '10px 14px', fontSize: 13, outline: 'none' }} />
            </div>
            {error && <div style={{ background: 'rgba(192,96,96,0.1)', border: '0.5px solid rgba(192,96,96,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#c06060' }}>{error}</div>}
            <button type="submit" disabled={loading} style={{ marginTop: 6, background: 'rgba(184,184,200,0.1)', border: '0.5px solid rgba(184,184,200,0.3)', borderRadius: 8, color: '#b8b8c8', padding: '11px 0', fontSize: 14, fontWeight: 500, width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>MadWolfe Productions © {new Date().getFullYear()}</div>
      </div>
    </div>
  )
}
