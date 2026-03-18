import { useState, useEffect } from 'react'
import { TAXONOMY } from '../lib/taxonomy'
import { logTransaction, getTransactionsForMember } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function MemberModal({ member, myProfile, onClose }) {
  const { user } = useAuth()
  const [tab, setTab] = useState('profile') // 'profile' | 'offer' | 'history'
  const [hours, setHours] = useState(1)
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState(member.category || '')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const tierData = TAXONOMY[member.tier]
  const catData = tierData?.categories[member.category]
  const tierColor = tierData?.color || '#666'
  const levelName = catData?.levels?.[member.level_index] ?? catData?.levels?.[member.levelIndex] ?? ''
  const vsc = catData?.vsc

  const isOwnProfile = myProfile?.id === member.id

  useEffect(() => {
    if (tab === 'history') {
      loadHistory()
    }
  }, [tab])

  async function loadHistory() {
    setLoadingHistory(true)
    const { data } = await getTransactionsForMember(member.id)
    if (data) setHistory(data)
    setLoadingHistory(false)
  }

  async function handleOffer(e) {
    e.preventDefault()
    if (!myProfile) { setError('You need a member profile to make contributions.'); return }
    setSending(true)
    setError('')

    const { error: err } = await logTransaction({
      memberId: member.id,
      offeredBy: myProfile.id,
      hours: Number(hours),
      description: description.trim(),
      category,
    })

    if (err) {
      setError(err.message)
      setSending(false)
      return
    }

    setSent(true)
    setSending(false)
  }

  const tabStyle = (t) => ({
    padding: '6px 14px', fontSize: 10, letterSpacing: '0.1em',
    cursor: 'pointer', border: 'none', borderRadius: 2,
    background: tab === t ? '#0a1a16' : 'none',
    color: tab === t ? '#7EB8A4' : '#333',
  })

  const inputStyle = {
    width: '100%', background: '#0e0e0e', border: '1px solid #1a1a1a',
    borderRadius: 2, padding: '10px 13px', color: '#ccc', fontSize: 13,
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: '#000000cc',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 20,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0c0c0c', border: '1px solid #1a1a1a',
          borderRadius: 4, width: '100%', maxWidth: 500,
          maxHeight: '90vh', overflowY: 'auto',
          padding: 36, position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer' }}
        >
          ×
        </button>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontFamily: "'Playfair Display', serif", color: '#e8e4dc', marginBottom: 4 }}>
            {member.name}
          </div>
          <div style={{ fontSize: 12, color: '#444' }}>{member.title}</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #111', paddingBottom: 12 }}>
          <button style={tabStyle('profile')} onClick={() => setTab('profile')}>PROFILE</button>
          {!isOwnProfile && user && <button style={tabStyle('offer')} onClick={() => setTab('offer')}>OFFER CONTRIBUTION</button>}
          <button style={tabStyle('history')} onClick={() => setTab('history')}>HISTORY</button>
        </div>

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div>
            {member.description && (
              <div style={{ fontSize: 12, color: '#555', lineHeight: 1.7, marginBottom: 24 }}>
                {member.description}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.16em', marginBottom: 5 }}>TIER</div>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', border: `1px solid ${tierColor}33`,
                  borderRadius: 2, color: tierColor, fontSize: 10,
                  letterSpacing: '0.08em', background: `${tierColor}0a`,
                }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: tierColor }} />
                  {member.tier === 'I' ? 'TIER I' : member.tier === 'II' ? 'TIER II' : 'TIER III'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.16em', marginBottom: 5 }}>CATEGORY</div>
                <div style={{ fontSize: 12, color: '#555' }}>{member.category || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.16em', marginBottom: 5 }}>LEVEL</div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {levelName || '—'}
                  {vsc && vsc >= 1.7 && (
                    <span style={{ marginLeft: 8, fontSize: 9, color: '#B87A6E', border: '1px solid #B87A6E22', padding: '1px 6px', borderRadius: 2 }}>
                      VSC {vsc.toFixed(1)}×
                    </span>
                  )}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.16em', marginBottom: 5 }}>MEMBER SINCE</div>
                <div style={{ fontSize: 12, color: '#555' }}>
                  {member.start_date ? new Date(member.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '—'}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, borderTop: '1px solid #111', paddingTop: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, color: tierColor, marginBottom: 3 }}>{member.contribution_score?.toLocaleString() || '0'}</div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.12em' }}>SCORE</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, color: '#ccc', marginBottom: 3 }}>{member.credits?.toLocaleString() || '0'}</div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.12em' }}>CREDITS</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, color: '#555', marginBottom: 3 }}>{member.verified_transactions || '0'}</div>
                <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.12em' }}>VERIFIED</div>
              </div>
            </div>
          </div>
        )}

        {/* OFFER CONTRIBUTION TAB */}
        {tab === 'offer' && (
          <div>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '30px 0' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>✓</div>
                <div style={{ fontSize: 14, color: '#7EB8A4', marginBottom: 8 }}>Contribution logged</div>
                <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>
                  This contribution is pending verification by {member.name}.<br />
                  Credits and score will update once verified.
                </div>
              </div>
            ) : (
              <form onSubmit={handleOffer} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6, marginBottom: 4 }}>
                  Log a contribution you are offering to <span style={{ color: '#7EB8A4' }}>{member.name}</span>.
                  They will need to verify it before credits are awarded.
                </div>

                <div>
                  <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.16em', marginBottom: 5 }}>HOURS *</div>
                  <input
                    style={inputStyle}
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={hours}
                    onChange={e => setHours(e.target.value)}
                    required
                  />
                  <div style={{ fontSize: 10, color: '#222', marginTop: 4 }}>1 hour = 1 credit</div>
                </div>

                <div>
                  <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.16em', marginBottom: 5 }}>CATEGORY *</div>
                  <div style={{ position: 'relative' }}>
                    <select
                      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', paddingRight: 30 }}
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      required
                    >
                      <option value="">Select category...</option>
                      {Object.entries(TAXONOMY).map(([tier, t]) =>
                        Object.keys(t.categories).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))
                      )}
                    </select>
                    <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#333', pointerEvents: 'none', fontSize: 9 }}>▾</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.16em', marginBottom: 5 }}>DESCRIPTION *</div>
                  <textarea
                    style={{ ...inputStyle, minHeight: 90, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe what you contributed or are offering..."
                    required
                  />
                </div>

                {error && (
                  <div style={{ fontSize: 11, color: '#B87A6E', padding: '8px 12px', background: '#1a0e0e', borderRadius: 2 }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  style={{
                    width: '100%', padding: '12px', background: '#0a1a16',
                    border: '1px solid #7EB8A440', borderRadius: 2,
                    color: '#7EB8A4', fontSize: 12, letterSpacing: '0.1em',
                    cursor: sending ? 'not-allowed' : 'pointer',
                  }}
                >
                  {sending ? 'LOGGING...' : 'LOG CONTRIBUTION'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === 'history' && (
          <div>
            {loadingHistory ? (
              <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 11, color: '#333', letterSpacing: '0.1em' }}>
                LOADING...
              </div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 0', fontSize: 11, color: '#2a2a2a', letterSpacing: '0.08em' }}>
                No contributions logged yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map(t => (
                  <div key={t.id} style={{
                    padding: '12px 14px', borderRadius: 2,
                    background: t.verified ? '#0e1612' : '#0e0e0e',
                    border: `1px solid ${t.verified ? '#7EB8A418' : '#111'}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 12, color: '#777' }}>{t.description}</div>
                      <div style={{ fontSize: 11, color: t.verified ? '#7EB8A4' : '#444', whiteSpace: 'nowrap', marginLeft: 12 }}>
                        {t.verified ? '✓ verified' : t.status === 'rejected' ? '✗ rejected' : '⏳ pending'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16, fontSize: 10, color: '#333' }}>
                      <span>{t.hours} hr{t.hours !== 1 ? 's' : ''}</span>
                      <span>{t.category}</span>
                      {t.score_awarded && <span>+{t.score_awarded} score</span>}
                      <span>{new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
