import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signIn, signUp } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [sponsorCode, setSponsorCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit() {
    setError('')
    setLoading(true)
    if (mode === 'signin') {
      const { error } = await signIn({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      if (!sponsorCode.trim()) {
        setError('A sponsor code from an existing member is required to join.')
        setLoading(false)
        return
      }
      const { error } = await signUp({ email, password, fullName })
      if (error) setError(error.message)
      else {
        setMode('signin')
        setError('✓ Account created. Check your email to confirm, then sign in.')
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', background: '#111', border: '1px solid #1a1a1a',
    borderRadius: 2, padding: '10px 12px', color: '#ccc', fontSize: 13,
    marginBottom: 14, fontFamily: "'DM Mono', monospace",
  }

  const labelStyle = {
    fontSize: 10, color: '#555', letterSpacing: '0.1em',
    display: 'block', marginBottom: 6,
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#080808', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 20,
      fontFamily: "'DM Mono', monospace",
    }}>
      <div style={{
        width: '100%', maxWidth: 420, border: '1px solid #1a1a1a',
        borderRadius: 4, padding: '40px 36px', background: '#0a0a0a',
      }}>
        <div style={{ fontSize: 10, color: '#444', letterSpacing: '0.2em', marginBottom: 8 }}>
          CONTRIBUTIONISM
        </div>
        <div style={{ fontSize: 26, fontFamily: "'Playfair Display', serif", color: '#e8e4dc', marginBottom: 6 }}>
          The Public Ledger
        </div>
        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, marginBottom: 32 }}>
          A non-monetary exchange system. 1 credit = 1 hour of service.
          Joining requires verification by an existing member.
        </div>

        <div style={{ display: 'flex', marginBottom: 28, borderBottom: '1px solid #1a1a1a' }}>
          {['signin', 'join'].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                flex: 1, padding: '10px 0', background: 'none', border: 'none',
                borderBottom: mode === m ? '2px solid #7EB8A4' : '2px solid transparent',
                color: mode === m ? '#7EB8A4' : '#444',
                fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
                marginBottom: -1, fontFamily: "'DM Mono', monospace",
              }}
            >
              {m === 'signin' ? 'SIGN IN' : 'JOIN'}
            </button>
          ))}
        </div>

        {mode === 'join' && (
          <div>
            <label style={labelStyle}>FULL NAME</label>
            <input
              style={inputStyle}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Your full name"
            />
            <label style={labelStyle}>SPONSOR CODE</label>
            <input
              style={inputStyle}
              value={sponsorCode}
              onChange={e => setSponsorCode(e.target.value)}
              placeholder="Code from your verifying member"
            />
          </div>
        )}

        <label style={labelStyle}>EMAIL</label>
        <input
          style={inputStyle}
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
        />

        <label style={labelStyle}>PASSWORD</label>
        <input
          style={inputStyle}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••••"
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
        />

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: '#0a1a16',
            border: '1px solid #7EB8A440', borderRadius: 2, color: '#7EB8A4',
            fontSize: 12, letterSpacing: '0.1em', cursor: 'pointer', marginTop: 8,
            fontFamily: "'DM Mono', monospace",
          }}
        >
          {loading ? 'PROCESSING...' : mode === 'signin' ? 'ENTER THE LEDGER' : 'REQUEST MEMBERSHIP'}
        </button>

        {error && (
          <div style={{
            fontSize: 11, marginTop: 10, textAlign: 'center',
            color: error.startsWith('✓') ? '#7EB8A4' : '#B87A6E',
          }}>
            {error}
          </div>
        )}

        <div style={{ fontSize: 10, color: '#333', marginTop: 20, lineHeight: 1.7, textAlign: 'center' }}>
          The ledger is publicly viewable.<br />
          An account is required to log contributions,<br />
          contact members, or verify transactions.
        </div>
      </div>
    </div>
  )
}