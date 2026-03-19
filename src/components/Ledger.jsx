import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { TAXONOMY, CONTACT_STATUSES, SAMPLE_MEMBERS, CREDIT_SYSTEM } from '../lib/taxonomy'
import { getMembers, getMyProfile } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import MemberModal from './MemberModal'
import InvitePanel from './InvitePanel'
import { getMyProfile } from '../lib/supabase'
import InvitePanel from './InvitePanel'
import ProfileEditor from './ProfileEditor'

const ALL = 'ALL'

function TierPip({ tier, small }) {
  const t = TAXONOMY[tier]
  if (!t) return null
  return (
    <span style={{display:'inline-flex',alignItems:'center',gap:4,padding:small?'2px 7px':'3px 10px',border:`1px solid ${t.color}33`,borderRadius:2,color:t.color,fontSize:small?9:10,letterSpacing:'0.08em',background:`${t.color}0a`,whiteSpace:'nowrap'}}>
      <span style={{width:4,height:4,borderRadius:'50%',background:t.color,flexShrink:0}}/>
      {tier==='I'?'TIER I':tier==='II'?'TIER II':'TIER III'}
    </span>
  )
}

function StatusDot({status}){
  const info=CONTACT_STATUSES[status]||CONTACT_STATUSES.none
  if(status==='none')return null
  return(
    <span style={{display:'inline-flex',alignItems:'center',gap:4,fontSize:9,color:info.color}}>
      <span style={{width:4,height:4,borderRadius:'50%',background:info.color,flexShrink:0}}/>
      {info.label}
    </span>
  )
}

export default function Ledger(){
  const {user}=useAuth()
  const navigate=useNavigate()
  const [members,setMembers]=useState(SAMPLE_MEMBERS)
  const [selected,setSelected]=useState(null)
  const [search,setSearch]=useState('')
  const [filterTier,setFilterTier]=useState(ALL)
  const [filterCat,setFilterCat]=useState(ALL)
  const [sortBy,setSortBy]=useState('score')
  const [loading,setLoading]=useState(false)
  const [myProfile,setMyProfile]=useState(null)
  const [showInvite,setShowInvite]=useState(false)
  const [showProfile,setShowProfile]=useState(false)

  useEffect(()=>{
    async function load(){
      setLoading(true)
      const {data}=await getMembers()
      if(data&&data.length>0)setMembers(data)
      if(user){
        const {data:profile}=await getMyProfile(user.id)
        if(profile)setMyProfile(profile)
        else setShowProfile(true)
      }
      setLoading(false)
    }
    load()
  },[user])

  async function handleProfileSaved(updatedProfile){
    setMyProfile(updatedProfile)
    const {data}=await getMembers()
    if(data&&data.length>0)setMembers(data)
  }

  const filtered=useMemo(()=>{
    let list=[...members]
    if(search){
      const q=search.toLowerCase()
      list=list.filter(m=>m.name?.toLowerCase().includes(q)||m.title?.toLowerCase().includes(q)||m.category?.toLowerCase().includes(q)||m.skills?.some(s=>s.toLowerCase().includes(q)))
    }
    if(filterTier!==ALL)list=list.filter(m=>m.tier===filterTier)
    if(filterCat!==ALL)list=list.filter(m=>m.category===filterCat)
    if(sortBy==='score')list.sort((a,b)=>(b.contribution_score||0)-(a.contribution_score||0))
    if(sortBy==='name')list.sort((a,b)=>a.name.localeCompare(b.name))
    if(sortBy==='recent')list.sort((a,b)=>new Date(b.start_date)-new Date(a.start_date))
    if(sortBy==='verified')list.sort((a,b)=>(b.verified_transactions||0)-(a.verified_transactions||0))
    if(sortBy==='vsc'){list.sort((a,b)=>{const va=TAXONOMY[a.tier]?.categories[a.category]?.vsc||0;const vb=TAXONOMY[b.tier]?.categories[b.category]?.vsc||0;return vb-va})}
    return list
  },[members,search,filterTier,filterCat,sortBy])

  const selectStyle={background:'#0e0e0e',border:'1px solid #1a1a1a',borderRadius:2,padding:'8px 28px 8px 11px',color:'#777',fontSize:11,cursor:'pointer',letterSpacing:'0.04em'}

  return(
    <div style={{minHeight:'100vh',background:'#080808',paddingBottom:80}}>
      <div style={{borderBottom:'1px solid #141414',padding:'28px 40px 22px'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:16}}>
            <div>
              <div style={{fontSize:10,color:'#333',letterSpacing:'0.22em',marginBottom:6}}>CONTRIBUTIONISM · PUBLIC LEDGER · PORTLAND PILOT</div>
              <div style={{fontSize:30,fontFamily:"'Playfair Display', serif",color:'#e8e4dc',lineHeight:1.1}}>The Contribution Registry</div>
              <div style={{fontSize:11,color:'#444',marginTop:6}}>1 credit = 1 hour of service · contributions verified by members · credits depreciate {CREDIT_SYSTEM.depreciationRate*100}%/week</div>
            </div>
            <div style={{display:'flex',gap:10,alignItems:'center'}}>
              {user?(
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setShowInvite(true)} style={{padding:'8px 18px',background:'#0a1a16',border:'1px solid #7EB8A440',borderRadius:2,color:'#7EB8A4',fontSize:11,letterSpacing:'0.08em',cursor:'pointer'}}>INVITE</button>
                  <button onClick={()=>setShowProfile(true)} style={{padding:'8px 18px',background:'#0e0e0e',border:'1px solid #2a2a2a',borderRadius:2,color:'#666',fontSize:11,letterSpacing:'0.08em',cursor:'pointer'}}>PROFILE</button>
                  <span style={{fontSize:11,color:'#7EB8A4',border:'1px solid #7EB8A422',borderRadius:2,padding:'7px 14px'}}>✓ MEMBER</span>
                </div>
              ):(
                <button onClick={()=>navigate('/auth')} style={{padding:'8px 18px',background:'#0a1a16',border:'1px solid #7EB8A440',borderRadius:2,color:'#7EB8A4',fontSize:11,letterSpacing:'0.08em',cursor:'pointer'}}>JOIN / SIGN IN</button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{padding:'14px 40px',borderBottom:'1px solid #0e0e0e',background:'#080808',position:'sticky',top:0,zIndex:100}}>
        <div style={{maxWidth:1000,margin:'0 auto',display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, title, skill, category..." style={{flex:'1 1 260px',background:'#0e0e0e',border:'1px solid #1a1a1a',borderRadius:2,padding:'8px 13px',color:'#ccc',fontSize:12}}/>
          <div style={{position:'relative'}}>
            <select value={filterTier} onChange={e=>setFilterTier(e.target.value)} style={selectStyle}>
              <option value={ALL}>All Tiers</option>
              <option value="I">Tier I — General</option>
              <option value="II">Tier II — Skilled</option>
              <option value="III">Tier III — Advanced</option>
            </select>
            <span style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:'#333',pointerEvents:'none',fontSize:9}}>▾</span>
          </div>
          <div style={{position:'relative'}}>
            <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} style={selectStyle}>
              <option value={ALL}>All Categories</option>
              {Object.entries(TAXONOMY).map(([tier,t])=>Object.keys(t.categories).map(cat=>(<option key={cat} value={cat}>{cat}</option>)))}
            </select>
            <span style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:'#333',pointerEvents:'none',fontSize:9}}>▾</span>
          </div>
          <div style={{position:'relative'}}>
            <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={selectStyle}>
              <option value="score">Sort: Score</option>
              <option value="vsc">Sort: VSC (Vital Work First)</option>
              <option value="verified">Sort: Most Verified</option>
              <option value="recent">Sort: Most Recent</option>
              <option value="name">Sort: Name</option>
            </select>
            <span style={{position:'absolute',right:9,top:'50%',transform:'translateY(-50%)',color:'#333',pointerEvents:'none',fontSize:9}}>▾</span>
          </div>
          <div style={{fontSize:10,color:'#2a2a2a',marginLeft:'auto',letterSpacing:'0.1em'}}>{filtered.length} MEMBER{filtered.length!==1?'S':''}</div>
        </div>
      </div>

      <div style={{padding:'10px 40px',borderBottom:'1px solid #0c0c0c'}}>
        <div style={{maxWidth:1000,margin:'0 auto',display:'grid',gridTemplateColumns:'220px 1fr 160px 90px 90px 100px',gap:12,fontSize:9,color:'#2a2a2a',letterSpacing:'0.14em'}}>
          <span>NAME</span><span>CATEGORY · LEVEL</span><span>TIER</span>
          <span style={{textAlign:'right'}}>SCORE</span>
          <span style={{textAlign:'right'}}>VERIFIED</span>
          <span style={{textAlign:'right'}}>STATUS</span>
        </div>
      </div>

      <div style={{padding:'0 40px'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          {loading&&<div style={{padding:'40px 0',textAlign:'center',fontSize:11,color:'#333',letterSpacing:'0.1em'}}>LOADING...</div>}
          {filtered.map((m)=>{
            const tierData=TAXONOMY[m.tier]
            const catData=tierData?.categories[m.category]
            const tierColor=tierData?.color||'#666'
            const levelName=catData?.levels?.[m.levelIndex]||''
            const vsc=catData?.vsc
            return(
              <div key={m.id} onClick={()=>setSelected(m)} style={{display:'grid',gridTemplateColumns:'220px 1fr 160px 90px 90px 100px',gap:12,padding:'13px 0',borderBottom:'1px solid #0c0c0c',cursor:'pointer',transition:'background 0.1s',borderRadius:2}} onMouseEnter={e=>e.currentTarget.style.background='#0d0d0d'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <div>
                  <div style={{fontSize:14,color:'#bbb',marginBottom:2}}>{m.name}</div>
                  <div style={{fontSize:10,color:'#3a3a3a'}}>{m.title}</div>
                </div>
                <div>
                  <div style={{fontSize:12,color:'#555',marginBottom:3}}>{m.category}</div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:10,color:'#333'}}>{levelName}</span>
                    {vsc&&vsc>=1.7&&<span style={{fontSize:9,color:'#B87A6E',border:'1px solid #B87A6E22',padding:'1px 6px',borderRadius:2}}>VSC {vsc.toFixed(1)}×</span>}
                  </div>
                </div>
                <div style={{display:'flex',alignItems:'center'}}><TierPip tier={m.tier} small/></div>
                <div style={{textAlign:'right',display:'flex',flexDirection:'column',justifyContent:'center'}}>
                  <span style={{fontSize:14,color:tierColor}}>{m.contribution_score?.toLocaleString()}</span>
                </div>
                <div style={{textAlign:'right',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
                  <span style={{fontSize:13,color:'#555'}}>{m.verified_transactions}</span>
                </div>
                <div style={{textAlign:'right',display:'flex',alignItems:'center',justifyContent:'flex-end'}}>
                  <StatusDot status={m.contact_status}/>
                </div>
              </div>
            )
          })}
          {!loading&&filtered.length===0&&<div style={{padding:'60px 0',textAlign:'center',color:'#2a2a2a',fontSize:12,letterSpacing:'0.1em'}}>NO MEMBERS MATCH YOUR SEARCH</div>}
        </div>
      </div>

      <div style={{position:'fixed',bottom:0,left:0,right:0,background:'#050505',borderTop:'1px solid #111',padding:'10px 40px',display:'flex',flexWrap:'wrap',fontSize:9,color:'#222',letterSpacing:'0.1em',justifyContent:'center'}}>
        {['ENTRY: 100 CREDITS','ACCESS UNLOCKS: 25 → 50 → 100 CREDITS','DEPRECIATION: 2%/WEEK ON UNSPENT BALANCE','VERIFICATION: EXISTING MEMBER REQUIRED TO JOIN','SCORING: HOURS × TIER × LEVEL × VSC × CONSISTENCY'].map((item,i)=>(
          <span key={i} style={{padding:'0 14px',borderLeft:i>0?'1px solid #1a1a1a':'none'}}>{item}</span>
        ))}
      </div>

      {selected&&<MemberModal member={selected} myProfile={myProfile} onClose={()=>setSelected(null)}/>}
      {showInvite&&myProfile&&<InvitePanel memberId={myProfile.id} onClose={()=>setShowInvite(false)}/>}
      {showProfile&&<ProfileEditor userId={user?.id} existingProfile={myProfile} onClose={()=>setShowProfile(false)} onSaved={handleProfileSaved}/>}
    </div>
  )
}
