import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp, validateSponsorCode } from '../lib/supabase'

const input = {
  width: '100%', background: '#0e0e0e', border: '1px solid #1a1a1a',
  borderRadius: 2, padding: '10px 13px', color: '#ccc', fontSize: 13,
  boxSizing: 'border-box', outline: 'none',
}

const btn = {
  width: '100%', padding: '11px', background: '#0a1a16',
  border: '1px solid #7EB8A440', borderRadius: 2,
  color: '#7EB8A4', fontSize: 12, letterSpacing: '0.1em',
  cursor: 'pointer', marginTop: 8,
}

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [codeStatus, setCodeStatus] = useState(null) // null | 'checking' | 'valid' | 'invalid'
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCheckCode() {
    if (!inviteCode.trim()) return
    setCodeStatus('checking')
    const { valid } = await validateSponsorCode(inviteCode)
    setCodeStatus(valid ? 'valid' : 'invalid')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'signup') {
      // Must have a valid invite code
      if (!inviteCode.trim()) {
        setError('An invite code is required to join.')
        setLoading(false)
        return
      }
      const { valid } = await validateSponsorCode(inviteCode)
      if (!valid) {
        setError('Invalid or already used invite code.')
        setCodeStatus('invalid')
        setLoading(false)
        return
      }

      const { data, error: signUpError } = await signUp({ email, password, fullName })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }

      // Store the code in localStorage so we can redeem it after email confirmation + first sign-in
      localStorage.setItem('pending_invite_code', inviteCode.trim().toUpperCase())

      setMessage('Check your email to confirm your account. Your invite code is saved and will be applied when you sign in.')
      setLoading(false)
      return
    }

    // Sign in
    const { error: signInError } = await signIn({ email, password })
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }
    navigate('/')
  }

  const codeColor = codeStatus === 'valid' ? '#7EB8A4' : codeStatus === 'invalid' ? '#B87A6E' : '#555'
  const codeLabel = codeStatus === 'valid' ? '✓ Valid code' : codeStatus === 'invalid' ? '✗ Invalid or used' : codeStatus === 'checking' ? 'Checking...' : ''

  return (
    <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.22em', marginBottom: 10 }}>
            CONTRIBUTIONISM · PUBLIC LEDGER
          </div>
          <div style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", color: '#e8e4dc' }}>
            {mode === 'signin' ? 'Sign In' : 'Request Access'}
          </div>
          {mode === 'signup' && (
            <div style={{ fontSize: 11, color: '#444', marginTop: 8 }}>
              You need an invite code from an existing member.
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {mode === 'signup' && (
            <input
              style={input}
              placeholder="Full name"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
          )}

          <input
            style={input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <input
            style={input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {mode === 'signup' && (
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={{ ...input, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                placeholder="INVITE CODE (e.g. ABCD-EFGH-IJKL)"
                value={inviteCode}
                onChange={e => { setInviteCode(e.target.value); setCodeStatus(null) }}
                onBlur={handleCheckCode}
                required
              />
              <button
                type="button"
                onClick={handleCheckCode}
                style={{
                  background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 2,
                  color: '#555', fontSize: 11, padding: '0 12px', cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                CHECK
              </button>
            </div>
          )}

          {codeStatus && codeStatus !== 'checking' && (
            <div style={{ fontSize: 11, color: codeColor, letterSpacing: '0.06em' }}>{codeLabel}</div>
          )}

          {error && (
            <div style={{ fontSize: 11, color: '#B87A6E', padding: '8px 12px', background: '#1a0e0e', borderRadius: 2, border: '1px solid #B87A6E22' }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{ fontSize: 11, color: '#7EB8A4', padding: '8px 12px', background: '#0a1a16', borderRadius: 2, border: '1px solid #7EB8A422' }}>
              {message}
            </div>
          )}

          <button type="submit" style={btn} disabled={loading}>
            {loading ? 'LOADING...' : mode === 'signin' ? 'SIGN IN' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setMessage('') }}
            style={{ background: 'none', border: 'none', color: '#444', fontSize: 11, cursor: 'pointer', letterSpacing: '0.06em' }}
          >
            {mode === 'signin' ? 'Need access? Request an invite →' : '← Back to sign in'}
          </button>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: 10, cursor: 'pointer', letterSpacing: '0.08em' }}
          >
            VIEW PUBLIC LEDGER
          </button>
        </div>
      </div>
    </div>
  )
}
