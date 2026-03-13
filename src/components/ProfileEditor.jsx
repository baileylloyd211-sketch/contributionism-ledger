import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TAXONOMY } from '../lib/taxonomy'

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

const section = {
  marginBottom: 28,
}

export async function upsertMember(profile) {
  const { data, error } = await supabase
    .from('members')
    .upsert(profile, { onConflict: 'auth_id' })
    .select()
    .single()
  return { data, error }
}

export default function ProfileEditor({ userId, existingProfile, onClose, onSaved }) {
  const isNew = !existingProfile?.id

  const [name, setName] = useState(existingProfile?.name || '')
  const [title, setTitle] = useState(existingProfile?.title || '')
  const [description, setDescription] = useState(existingProfile?.description || '')
  const [tier, setTier] = useState(existingProfile?.tier || 'I')
  const [category, setCategory] = useState(existingProfile?.category || '')
  const [levelIndex, setLevelIndex] = useState(existingProfile?.level_index ?? 0)
  const [startDate, setStartDate] = useState(existingProfile?.start_date || new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // When tier changes, reset category and level
  useEffect(() => {
    if (!existingProfile) {
      setCategory('')
      setLevelIndex(0)
    }
  }, [tier])

  const tierData = TAXONOMY[tier]
  const categories = tierData ? Object.keys(tierData.categories) : []
  const levels = (tierData && category && tierData.categories[category])
    ? tierData.categories[category].levels || []
    : []

  async function handleSave(e) {
    e.preventDefault()
    setError('')
    setSaving(true)

    if (!name.trim()) { setError('Name is required.'); setSaving(false); return }
    if (!category) { setError('Please select a category.'); setSaving(false); return }

    const profile = {
      auth_id: userId,
      name: name.trim(),
      title: title.trim(),
      description: description.trim(),
      tier,
      category,
      level_index: levelIndex,
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

    const { data, error: saveError } = await upsertMember(profile)
    if (saveError) {
      setError(saveError.message)
      setSaving(false)
      return
    }

    setSuccess(true)
    setSaving(false)
    if (onSaved) onSaved(data)
    setTimeout(() => setSuccess(false), 2500)
  }

  const selectStyle = {
    ...input,
    cursor: 'pointer',
    appearance: 'none',
    paddingRight: 30,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: '#000000cc',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, padding: 20, overflowY: 'auto',
    }}>
      <div style={{
        background: '#0c0c0c', border: '1px solid #1a1a1a',
        borderRadius: 4, width: '100%', maxWidth: 500,
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
          {isNew && (
            <div style={{ fontSize: 11, color: '#444', marginTop: 8, lineHeight: 1.6 }}>
              Fill in your details to appear in the contribution registry.
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          {/* Identity */}
          <div style={section}>
            <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.18em', marginBottom: 14, borderBottom: '1px solid #111', paddingBottom: 6 }}>
              IDENTITY
            </div>
            <div style={{ marginBottom: 14 }}>
              <span style={label}>FULL NAME *</span>
              <input style={input} value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" required />
            </div>
            <div>
              <span style={label}>TITLE / ROLE</span>
              <input style={input} value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Community Organizer, Software Developer" />
            </div>
          </div>

          {/* Bio */}
          <div style={section}>
            <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.18em', marginBottom: 14, borderBottom: '1px solid #111', paddingBottom: 6 }}>
              BIO
            </div>
            <span style={label}>DESCRIPTION</span>
            <textarea
              style={{ ...input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of your work and what you contribute to the community..."
            />
          </div>

          {/* Classification */}
          <div style={section}>
            <div style={{ fontSize: 9, color: '#222', letterSpacing: '0.18em', marginBottom: 14, borderBottom: '1px solid #111', paddingBottom: 6 }}>
              CLASSIFICATION
            </div>

            {/* Tier */}
            <div style={{ marginBottom: 14 }}>
              <span style={label}>TIER *</span>
              <div style={{ position: 'relative' }}>
                <select style={selectStyle} value={tier} onChange={e => setTier(e.target.value)}>
                  {Object.entries(TAXONOMY).map(([t, data]) => (
                    <option key={t} value={t}>
                      Tier {t} — {data.label}
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#333', pointerEvents: 'none', fontSize: 9 }}>▾</span>
              </div>
              {tierData && (
                <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 5 }}>{tierData.description}</div>
              )}
            </div>

            {/* Category */}
            <div style={{ marginBottom: 14 }}>
              <span style={label}>CATEGORY *</span>
              <div style={{ position: 'relative' }}>
                <select style={selectStyle} value={category} onChange={e => { setCategory(e.target.value); setLevelIndex(0) }}>
                  <option value="">Select a category...</option>
                  {categories.map(cat => {
                    const vsc = tierData?.categories[cat]?.vsc
                    return (
                      <option key={cat} value={cat}>
                        {cat}{vsc && vsc >= 1.7 ? ` · VSC ${vsc.toFixed(1)}×` : ''}
                      </option>
                    )
                  })}
                </select>
                <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#333', pointerEvents: 'none', fontSize: 9 }}>▾</span>
              </div>
            </div>

            {/* Level */}
            {levels.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <span style={label}>LEVEL *</span>
                <div style={{ position: 'relative' }}>
                  <select style={selectStyle} value={levelIndex} onChange={e => setLevelIndex(Number(e.target.value))}>
                    {levels.map((lvl, i) => (
                      <option key={i} value={i}>{lvl}</option>
                    ))}
                  </select>
                  <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#333', pointerEvents: 'none', fontSize: 9 }}>▾</span>
                </div>
              </div>
            )}

            {/* Start date */}
            <div>
              <span style={label}>START DATE</span>
              <input
                style={input}
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
              <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 5 }}>
                When did you begin contributing to this community?
              </div>
            </div>
          </div>

          {error && (
            <div style={{ fontSize: 11, color: '#B87A6E', padding: '8px 12px', background: '#1a0e0e', borderRadius: 2, border: '1px solid #B87A6E22', marginBottom: 16 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ fontSize: 11, color: '#7EB8A4', padding: '8px 12px', background: '#0a1a16', borderRadius: 2, border: '1px solid #7EB8A422', marginBottom: 16 }}>
              ✓ Profile saved successfully.
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%', padding: '12px', background: '#0a1a16',
              border: '1px solid #7EB8A440', borderRadius: 2,
              color: '#7EB8A4', fontSize: 12, letterSpacing: '0.1em',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'SAVING...' : isNew ? 'CREATE PROFILE' : 'SAVE CHANGES'}
          </button>
        </form>
      </div>
    </div>
  )
}
