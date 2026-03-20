import { useState, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom'; // commented for prototype; add back when needed
// import { getMembers, getMyProfile } from '../lib/supabase'; // commented until real backend
import { TAXONOMY } from '../lib/taxonomy'; // assume this has domain/category mappings

// Mock data shaped to Contributionism spec
const SAMPLE_MEMBERS = [
  {
    id: '1',
    name: 'Lloyd F. Bailey',
    title: 'Systems Designer – Portland Pilot',
    category: 'Technology',
    level: 'Principal Engineer',
    tier: 'II', // maps to Advanced
    contribution_score: 8.7,
    verified_events: 12,
    contact_status: 'active',
  },
  // add more mocks as needed
];

const CS_TIERS = [
  { min: 0, max: 0.1, label: 'Baseline', perks: 'Guaranteed floor access' },
  { min: 0.1, max: 4.9, label: 'Contributor', perks: '5% utility discount' },
  { min: 5.0, max: 12.9, label: 'Advanced', perks: '5% discount + $10k micro-grant eligibility' },
  { min: 13.0, max: 24.9, label: 'Expert', perks: 'Above + 30-day permit fast-track' },
  { min: 25.0, max: 47.9, label: 'Principal', perks: 'Above + low-interest loans' },
  { min: 48.0, label: 'Founding', perks: 'Above + lifetime 10% discount + naming rights' },
];

function getTier(score) {
  return CS_TIERS.find(t => score >= t.min && (t.max === undefined || score <= t.max)) || CS_TIERS[0];
}

function TierBadge({ tierLabel, small = false }) {
  const t = CS_TIERS.find(t => t.label === tierLabel) || {};
  if (!t.label) return null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: small ? '2px 7px' : '3px 10px',
        border: `1px solid ${t.color || '#666'}33`,
        borderRadius: 2,
        color: t.color || '#777',
        fontSize: small ? 9 : 10,
        letterSpacing: '0.08em',
        background: `${t.color || '#444'}0a`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: t.color || '#666', flexShrink: 0 }} />
      {tierLabel}
    </span>
  );
}

export default function Ledger() {
  // const { user } = useAuth(); // commented for prototype
  // const navigate = useNavigate();

  const [members] = useState(SAMPLE_MEMBERS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState('ALL');
  const [sortBy, setSortBy] = useState('score');

  // Mock CS calculator state
  const [calcInputs, setCalcInputs] = useState({
    T: 2.5, S: 2.0, R: 2.0, I: 2.5, output: 0.9, quality: 0.85, impact: 0.8,
  });

  const calculatedCS = useMemo(() => {
    const role = calcInputs.T * calcInputs.S * calcInputs.R * calcInputs.I;
    const perf = calcInputs.output * calcInputs.quality * calcInputs.impact;
    return Number((role * perf).toFixed(2));
  }, [calcInputs]);

  const calcTier = getTier(calculatedCS);

  const filtered = useMemo(() => {
    let list = [...members];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(m =>
        m.name?.toLowerCase().includes(q) ||
        m.title?.toLowerCase().includes(q) ||
        m.category?.toLowerCase().includes(q)
      );
    }
    if (filterTier !== 'ALL') list = list.filter(m => m.tier === filterTier);
    if (sortBy === 'score') list.sort((a, b) => (b.contribution_score || 0) - (a.contribution_score || 0));
    // add other sorts as needed
    return list;
  }, [members, search, filterTier, sortBy]);

  return (
    <div style={{ minHeight: '100vh', background: '#080808', paddingBottom: 120, color: '#ccc' }}>
      {/* Header */}
      <div style={{ borderBottom: '1px solid #141414', padding: '28px 40px 22px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: '#333', letterSpacing: '0.22em', marginBottom: 6 }}>
                CONTRIBUTIONISM · PORTLAND PILOT LEDGER
              </div>
              <div style={{ fontSize: 30, fontFamily: "'Playfair Display', serif", color: '#e8e4dc', lineHeight: 1.1 }}>
                Contribution Registry
              </div>
              <div style={{ fontSize: 11, color: '#444', marginTop: 6 }}>
                Civilizational impact scoring · 5-year rolling window · Decay 20%/year after 5 years
              </div>
            </div>
            {/* Auth buttons placeholder */}
            <div>
              <button
                style={{
                  padding: '8px 18px',
                  background: '#0a1a16',
                  border: '1px solid #7EB8A440',
                  borderRadius: 2,
                  color: '#7EB8A4',
                  fontSize: 11,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                }}
              >
                JOIN / SIGN IN (Mock)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '14px 40px', borderBottom: '1px solid #0e0e0e', position: 'sticky', top: 0, zIndex: 100, background: '#080808' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, title, category..."
            style={{ flex: '1 1 260px', background: '#0e0e0e', border: '1px solid #1a1a1a', borderRadius: 2, padding: '8px 13px', color: '#ccc', fontSize: 12 }}
          />
          <select value={filterTier} onChange={e => setFilterTier(e.target.value)} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', padding: '8px', color: '#ccc' }}>
            <option value="ALL">All Tiers</option>
            {['I', 'II', 'III'].map(t => <option key={t} value={t}>Tier {t}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ background: '#0e0e0e', border: '1px solid #1a1a1a', padding: '8px', color: '#ccc' }}>
            <option value="score">Sort: Score</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ padding: '10px 40px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr 140px 100px 100px', gap: 12, fontSize: 10, color: '#444', padding: '10px 0', borderBottom: '1px solid #141414' }}>
            <span>NAME</span>
            <span>CATEGORY · TITLE</span>
            <span>TIER</span>
            <span style={{ textAlign: 'right' }}>CS SCORE</span>
            <span style={{ textAlign: 'right' }}>VERIFIED EVENTS</span>
          </div>

          {filtered.map(m => {
            const tierInfo = getTier(m.contribution_score);
            return (
              <div
                key={m.id}
                onClick={() => setSelected(m)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '220px 1fr 140px 100px 100px',
                  gap: 12,
                  padding: '13px 0',
                  borderBottom: '1px solid #0c0c0c',
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 14, color: '#bbb' }}>{m.name}</div>
                  <div style={{ fontSize: 10, color: '#555' }}>{m.title}</div>
                </div>
                <div style={{ fontSize: 12, color: '#777' }}>{m.category}</div>
                <div><TierBadge tierLabel={tierInfo.label} /></div>
                <div style={{ textAlign: 'right', fontSize: 14, color: '#aaa' }}>{m.contribution_score?.toFixed(1)}</div>
                <div style={{ textAlign: 'right', fontSize: 13, color: '#555' }}>{m.verified_events}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simple CS Calculator Demo */}
      <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto', background: '#0a0a0a', borderRadius: 4 }}>
        <h3 style={{ color: '#ccc', marginBottom: 16 }}>Mock Contribution Score Calculator</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          {['T', 'S', 'R', 'I', 'output', 'quality', 'impact'].map(field => (
            <div key={field}>
              <label style={{ display: 'block', fontSize: 11, color: '#777', marginBottom: 4 }}>{field.toUpperCase()}</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max={field === 'T' || field === 'S' || field === 'R' || field === 'I' ? 4 : 1}
                value={calcInputs[field]}
                onChange={e => setCalcInputs({ ...calcInputs, [field]: Number(e.target.value) })}
                style={{ width: '100%', padding: 8, background: '#111', border: '1px solid #222', color: '#ddd', borderRadius: 2 }}
              />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, padding: 16, background: '#111', borderRadius: 4 }}>
          <div style={{ fontSize: 18, color: '#ccc' }}>Calculated CS: <strong>{calculatedCS}</strong></div>
          <div style={{ marginTop: 8 }}>Tier: <TierBadge tierLabel={calcTier.label} /></div>
          <div style={{ marginTop: 8, fontSize: 13, color: '#aaa' }}>Perks: {calcTier.perks}</div>
        </div>
      </div>

      {/* Footer info from spec */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#050505', borderTop: '1px solid #111', padding: '10px 40px', fontSize: 9, color: '#444', textAlign: 'center' }}>
        5-year rolling window · 20% annual decay after 5 years · No political activity scored · Hard schema limits enforced
      </div>

      {/* Modals / future components */}
 {selected && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,  // High z-index to ensure it's on top of everything
      backdropFilter: 'blur(6px)',  // Nice blur effect
    }}
    onClick={() => setSelected(null)}  // Close on backdrop click
  >
    <div
      style={{
        backgroundColor: '#111',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '85vh',
        overflowY: 'auto',
        padding: '32px',
        border: '1px solid #333',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        position: 'relative',
      }}
      onClick={(e) => e.stopPropagation()}  // Prevent closing when clicking inside
    >
      <h2 style={{ color: '#e8e4dc', marginBottom: 20, fontSize: 24 }}>
        {selected.name}
      </h2>

      <div style={{ color: '#ccc', lineHeight: 1.6, fontSize: 15 }}>
        <p><strong>Category:</strong> {selected.category || 'N/A'}</p>
        <p><strong>Title:</strong> {selected.title || 'N/A'}</p>
        <p><strong>Tier:</strong> {selected.tier || 'N/A'}</p>
        <p><strong>CS Score:</strong> {selected.contribution_score?.toFixed(1) || '0.0'}</p>
        <p><strong>Verified Events:</strong> {selected.verified_events || 0}</p>
        {/* Add more fields/perks later */}
      </div>

      <button
        onClick={() => setSelected(null)}
        style={{
          marginTop: 24,
          padding: '12px 28px',
          backgroundColor: '#0a1a16',
          border: '1px solid #7EB8A4',
          borderRadius: '6px',
          color: '#7EB8A4',
          fontSize: 14,
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Close
      </button>
    </div>
  </div>
)}
