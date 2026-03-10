import { useState } from 'react'
import { TAXONOMY, CONTACT_STATUSES } from '../lib/taxonomy'
import { sendContactRequest } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth.jsx'
import { useNavigate } from 'react-router-dom'

function ScoreBar({ score, max = 4000 }) {
  const pct = Math.min((score / max) * 100, 100)
  return (
    <div style={{ width: '100%', height: 3, background: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, #7EB8A4, #C4A35A, #B87A6E)', transition: 'width 0.8s ease' }} />
    </div>
  )
}

function StatBox({ label, value, color }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: 20, color: color || '#c8c4bc', fontFamily: "'DM Mono', monospace" }}>{value}</div>
    </div>
  )
}

export default function MemberModal({ member, onClose }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [contactType, setContactType] = useState(null)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const tierData = TAXONOMY[member.tier]
  const catData = tierData?.categories[member.category]
  const tierColor = tierData?.color || '#888'
  const levelName = catData?.levels?.[member.levelIndex] || 'Member'
  const statusInfo = CONTACT_STATUSES[member.contact_status] || CONTACT_STATUSES.none

  async function handleContact() {
    if (!user) { navigate('/auth'); return }
    if (!message.trim()) return
    setSending(true)
    await sendContactRequest({ fromId: user.id, toId: member.id, type: contactType, message })
    setSent(true)
    setSending(false)
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: 20,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 4,
        width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
        fontFamily: "'DM Mono', monospace",
      }}>
        <div style={{ padding: '28px 32px 22px', borderBottom: '1px solid #141414' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: '#e8e4dc', marginBottom: 4 }}>
                {member.name}
              </div>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 14 }}>{member.title}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  fontSize: 10, padding: '3px 10px', border: `1px solid ${tierColor}44`,
                  borderRadius: 2, color: tierColor, background: `${tierColor}0d`,
                  letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: tierColor }} />
                  {tierData?.label}
                </span>
                <span style={{ fontSize: 10, color: '#555', padding: '3px 9px', border: '1px solid #1a1a1a', borderRadius: 2 }}>
                  {member.category}
                </span>
                <span style={{ fontSize: 10, color: '#444', padding: '3px 9px', border: '1px solid #141414', borderRadius: 2 }}>
                  {levelName}
                </span>
              </div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
          </div>
        </div>

        <div style={{ padding: '22px 32px', borderBottom: '1px solid #141414' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 16 }}>
            <StatBox label="CONTRIBUTION SCORE" value={member.contribution_score?.toLocaleString()} color={tierColor} />
            <StatBox label="VERIFIED TRANSACTIONS" value={member.verified_transactions} />
            <StatBox label="MEMBER SINCE" value={new Date(member.start_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} />
          </div>
          <ScoreBar score={member.contribution_score} />
        </div>

        {catData && (
          <div style={{ padding: '16px 32px', borderBottom: '1px solid #141414', background: '#0c0c0c' }}>
            <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.12em', marginBottom: 6 }}>VITAL SYSTEMS COEFFICIENT</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 22, color: tierColor }}>{catData.vsc.toFixed(1)}×</div>
              <div style={{ fontSize: 11, color: '#555', lineHeight: 1.6 }}>{catData.description}</div>
            </div>
          </div>
        )}

        <div style={{ padding: '22px 32px', borderBottom: '1px solid #141414' }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 8 }}>ABOUT</div>
          <div style={{ fontSize: 13, color: '#999', lineHeight: 1.8 }}>{member.description}</div>
        </div>

        <div style={{ padding: '18px 32px', borderBottom: '1px solid #141414' }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 10 }}>CONTRIBUTION DOMAINS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.skills?.map(skill => (
              <span key={skill} style={{ fontSize: 11, color: '#666', border: '1px solid #1a1a1a', padding: '3px 10px', borderRadius: 2 }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div style={{ padding: '16px 32px', borderBottom: '1px solid #141414' }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 6 }}>VERIFIED BY</div>
          <div style={{ fontSize: 12, color: '#7EB8A4' }}>✓ {member.verified_by}</div>
          {member.consecutive_weeks > 0 && (
            <div style={{ fontSize: 11, color: '#444', marginTop: 4 }}>
              {member.consecutive_weeks} consecutive weeks active
            </div>
          )}
        </div>

        <div style={{ padding: '18px 32px', borderBottom: '1px solid #141414' }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 8 }}>CURRENT STATUS</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 2, background: statusInfo.bg, border: `1px solid ${statusInfo.color}22` }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: statusInfo.color }} />
            <span style={{ fontSize: 11, color: statusInfo.color }}>{statusInfo.label}</span>
          </div>
        </div>

        <div style={{ padding: '22px 32px' }}>
          <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.12em', marginBottom: 14 }}>MAKE CONTACT</div>
          {sent ? (
            <div style={{ fontSize: 12, color: '#7EB8A4', padding: '14px', border: '1px solid #7EB8A422', borderRadius: 2, background: '#0a1a16', textAlign: 'center' }}>
              ✓ Request sent. Status will update when they respond.
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {[
                  { key: 'service', label: 'REQUEST SERVICE' },
                  { key: 'collaboration', label: 'PROPOSE COLLABORATION' },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setContactType(key)} style={{
                    flex: 1, padding: '9px 0',
                    background: contactType === key ? (key === 'service' ? '#0a1a16' : '#1a1506') : 'transparent',
                    border: `1px solid ${contactType === key ? (key === 'service' ? '#7EB8A440' : '#C4A35A40') : '#1a1a1a'}`,
                    color: contactType === key ? (key === 'service' ? '#7EB8A4' : '#C4A35A') : '#444',
                    borderRadius: 2, cursor: 'pointer', fontSize: 10, letterSpacing: '0.08em',
                  }}>{label}</button>
                ))}
              </div>
              {contactType && (
                <>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder={contactType === 'service' ? 'Describe what you need and what you offer in return...' : 'Describe the collaboration you have in mind...'}
                    rows={3}
                    style={{
                      width: '100%', background: '#111', border: '1px solid #1a1a1a',
                      borderRadius: 2, padding: '10px 12px', color: '#aaa', fontSize: 12,
                      resize: 'vertical', lineHeight: 1.6, marginBottom: 10,
                      fontFamily: "'DM Mono', monospace",
                    }}
                  />
                  <button onClick={handleContact} disabled={sending || !message.trim()} style={{
                    width: '100%', padding: '11px', background: '#0a1a16',
                    border: '1px solid #7EB8A440', borderRadius: 2,
                    color: sending ? '#444' : '#7EB8A4',
                    fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
                    fontFamily: "'DM Mono', monospace",
                  }}>
                    {sending ? 'SENDING...' : user ? 'SEND REQUEST' : 'SIGN IN TO CONTACT'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
