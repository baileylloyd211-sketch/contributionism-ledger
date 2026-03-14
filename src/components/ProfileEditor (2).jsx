import { useState } from 'react'
import { supabase } from '../lib/supabase'

const input = {
  width: '100%',
  background: '#0e0e0e',
  border: '1px solid #1a1a1a',
  borderRadius: 2,
  padding: '10px 13px',
  color: '#ccc',
  fontSize: 13,
  boxSizing: 'border-box',
  outline: 'none',
}

const label = {
  fontSize: 9,
  color: '#333',
  letterSpacing: '0.16em',
  marginBottom: 5,
  display: 'block',
}

const readOnly = {
  width: '100%',
  background: '#080808',
  border: '1px solid #111',
  borderRadius: 2,
  padding: '10px 13px',
  color: '#2a2a2a',
  fontSize: 13,
  boxSizing: 'border-box',
  letterSpacing: '0.04em',
}

export default function ProfileEditor({ userId, existingProfile, onClose, onSaved }) {
  const isNew = !existingProfile?.id

  const [name, setName] = useState(existingProfile?.name || '')
  const [title, setTitle] = useState(existingProfile?.title || '')
  const [description, setDescription] = useState(existingProfile?.description || '')
  const [startDate, setStartDate] = useState(existingProfile?.start_date || new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    if (!name.trim()) {
      setError('Name is required.')
      setSaving(false)
      return
    }

    const updates = {
      auth_id: userId,
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      start_date: startDate,
      updated_at: new Date().toISOString(),
      ...(isNew ? {
        contribution_score: 0,
        verified_transactions: 0,
        earned_credits: 0,
        credits: 100,
        consecutive_weeks: 0,
        is_active: true,
        contact_status: 'none',
      } : {})
    }

    const { data, error: saveError } = await supabase
      .from('members')
      .upsert(updates, { onConflict: 'auth_id' })
      .select()
      .single()

    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    if (onSaved) onSaved(data)
    setTimeout(() => {
      setSuccess(false)
      onClose()
    }, 1500)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20, overflowY: 'auto',
    }}>
      <div style={{
        background: '#0c0c0c', border: '1px solid #1a1a1a',
        borderRadius: 4, width: '100%', maxWidth: 480,
        padding: 36, position: 'relative', margin: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer' }}
        >
          ×
        </button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 9, color: '#333', letterSpacing: '0.2em', marginBottom: 8 }}>
            {isNew ? 'COMPLETE YOUR PROFILE' : 'EDIT PROFILE'}
          </div>
          <div style={{ fontSize: 24, fontFamily: "'Playfair Display', serif", color: '#e8e4dc' }}>
            {isNew ? 'Welcome to the Ledger' : 'Your Member Profile'}
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          <div>
            <span style={label}>FULL NAME *</span>
            <input
              style={input}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div>
            <span style={label}>TITLE / ROLE</span>
            <input
              style={input}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Community Organizer, Software Developer"
            />
          </div>

          <div>
            <span style={label}>BIO</span>
            <textarea
              style={{ ...input, minHeight: 90, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of your work and what you contribute..."
            />
          </div>

          <div>
            <span style={label}>START DATE</span>
            <input
              style={input}
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
            />
          </div>

          {/* Read-only system fields shown for reference */}
          {existingProfile && (
            <div style={{ marginTop: 8, borderTop: '1px solid #111', paddingTop: 18 }}>
              <div style={{ fontSize: 9, color: '#1e1e1e', letterSpacing: '0.18em', marginBottom: 14 }}>
                SYSTEM FIELDS — MANAGED BY ADMIN
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <span style={{ ...label, color: '#1e1e1e' }}>TIER</span>
                  <div style={readOnly}>{existingProfile.tier || '—'}</div>
                </div>
                <div>
                  <span style={{ ...label, color: '#1e1e1e' }}>CATEGORY</span>
                  <div style={readOnly}>{existingProfile.category || '—'}</div>
                </div>
                <div>
                  <span style={{ ...label, color: '#1e1e1e' }}>SCORE</span>
                  <div style={readOnly}>{existingProfile.contribution_score ?? '0'}</div>
                </div>
                <div>
                  <span style={{ ...label, color: '#1e1e1e' }}>CREDITS</span>
                  <div style={readOnly}>{existingProfile.credits ?? '0'}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 11, color: '#B87A6E', padding: '8px 12px', background: '#1a0e0e', borderRadius: 2, border: '1px solid #B87A6E22' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ fontSize: 11, color: '#7EB8A4', padding: '8px 12px', background: '#0a1a16', borderRadius: 2, border: '1px solid #7EB8A422' }}>
              ✓ Profile saved.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '12px', background: '#0a1a16',
              border: '1px solid #7EB8A440', borderRadius: 2,
              color: '#7EB8A4', fontSize: 12, letterSpacing: '0.1em',
              cursor: saving ? 'not-allowed' : 'pointer', marginTop: 4,
            }}
          >
            {saving ? 'SAVING...' : isNew ? 'CREATE PROFILE' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>
    </div>
  )
}
