import { useState, useEffect } from 'react'
import { createSponsorCode, getMySponsorCodes } from '../lib/supabase'

export default function InvitePanel({ memberId, onClose }) {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(null)

  useEffect(() => {
    load()
  }, [memberId])

  async function load() {
    setLoading(true)
    const { data } = await getMySponsorCodes(memberId)
    if (data) setCodes(data)
    setLoading(false)
  }

  async function generate() {
    setError('')
    setGenerating(true)
    const { data, error } = await createSponsorCode(memberId)
    if (error) {
      setError(error.message)
    } else if (data) {
      setCodes(prev => [data, ...prev])
    }
    setGenerating(false)
  }

  function copy(code) {
    navigator.clipboard.writeText(code)
    setCopied(code)
    setTimeout(() => setCopied(null), 2000)
  }

  const unusedCount = codes.filter(c => !c.is_used).length

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20,
    }}>
      <div style={{
        background: '#0c0c0c', border: '1px solid #1a1a1a',
        borderRadius: 4, width: '100%', maxWidth: 460, padding: 32,
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#444', fontSize: 18, cursor: 'pointer' }}
        >
          ×
        </button>

        <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.2em', marginBottom: 8 }}>MEMBER INVITATIONS</div>
        <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", color: '#e8e4dc', marginBottom: 6 }}>
          Invite Someone
        </div>
        <div style={{ fontSize: 11, color: '#444', marginBottom: 24, lineHeight: 1.6 }}>
          Each code can be used once. You can have up to 3 unused codes at a time.
          Share them with people you'd personally vouch for.
        </div>

        {/* Generate button */}
        <button
          onClick={generate}
          disabled={generating || unusedCount >= 3}
          style={{
            width: '100%', padding: '11px', borderRadius: 2,
            background: unusedCount >= 3 ? '#0a0a0a' : '#0a1a16',
            border: `1px solid ${unusedCount >= 3 ? '#1a1a1a' : '#7EB8A440'}`,
            color: unusedCount >= 3 ? '#2a2a2a' : '#7EB8A4',
            fontSize: 12, letterSpacing: '0.1em', cursor: unusedCount >= 3 ? 'not-allowed' : 'pointer',
            marginBottom: 16,
          }}
        >
          {generating ? 'GENERATING...' : unusedCount >= 3 ? 'MAX 3 UNUSED CODES' : '+ GENERATE INVITE CODE'}
        </button>

        {error && (
          <div style={{ fontSize: 11, color: '#B87A6E', padding: '8px 12px', background: '#1a0e0e', borderRadius: 2, border: '1px solid #B87A6E22', marginBottom: 16 }}>
            {error}
          </div>
        )}

        {/* Code list */}
        {loading ? (
          <div style={{ fontSize: 11, color: '#333', textAlign: 'center', padding: '20px 0', letterSpacing: '0.1em' }}>LOADING...</div>
        ) : codes.length === 0 ? (
          <div style={{ fontSize: 11, color: '#2a2a2a', textAlign: 'center', padding: '20px 0', letterSpacing: '0.08em' }}>
            No codes yet — generate one above.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {codes.map(c => (
              <div key={c.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: 2,
                background: c.is_used ? '#0a0a0a' : '#0e1612',
                border: `1px solid ${c.is_used ? '#111' : '#7EB8A418'}`,
              }}>
                <div>
                  <div style={{
                    fontFamily: 'monospace', fontSize: 15, letterSpacing: '0.15em',
                    color: c.is_used ? '#2a2a2a' : '#7EB8A4',
                    textDecoration: c.is_used ? 'line-through' : 'none',
                  }}>
                    {c.code}
                  </div>
                  <div style={{ fontSize: 9, color: '#2a2a2a', letterSpacing: '0.1em', marginTop: 3 }}>
                    {c.is_used 
                      ? `USED · ${new Date(c.used_at).toLocaleDateString()}`
                      : `CREATED · ${new Date(c.created_at).toLocaleDateString()}`}
                  </div>
                </div>
                {!c.is_used && (
                  <button
                    onClick={() => copy(c.code)}
                    style={{
                      background: 'none', border: '1px solid #1a2a22', borderRadius: 2,
                      color: copied === c.code ? '#7EB8A4' : '#3a5a4a',
                      fontSize: 10, padding: '5px 10px', cursor: 'pointer', letterSpacing: '0.08em',
                    }}
                  >
                    {copied === c.code ? '✓ COPIED' : 'COPY'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 20, fontSize: 10, color: '#222', lineHeight: 1.7, borderTop: '1px solid #111', paddingTop: 16 }}>
          By sharing a code, you are personally vouching for this person.
          Their conduct in the ledger reflects on your sponsorship record.
        </div>
      </div>
    </div>
  )
}
