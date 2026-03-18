// v5
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://twdekfysohnzunxirgsl.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  return { data, error }
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('contribution_score', { ascending: false })
  return { data, error }
}

export async function getMyProfile(userId) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('auth_id', userId)
    .single()
  return { data, error }
}

export async function sendContactRequest({ fromId, toId, type, message }) {
  const { data, error } = await supabase
    .from('contact_requests')
    .insert({ from_member_id: fromId, to_member_id: toId, type, message, status: 'pending' })
    .select()
    .single()
  return { data, error }
}

export async function updateContactStatus(requestId, status) {
  const { data, error } = await supabase
    .from('contact_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', requestId)
    .select()
    .single()
  return { data, error }
}

// ── Sponsor Code System ─────────────────────────────────────────────────────

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const segment = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${segment()}-${segment()}-${segment()}`
}

export async function createSponsorCode(memberId) {
  const { data: existing } = await supabase
    .from('sponsor_codes')
    .select('id')
    .eq('created_by', memberId)
    .eq('is_used', false)

  if (existing && existing.length >= 3) {
    return { data: null, error: { message: 'You already have 3 unused invite codes. Wait for one to be used before generating more.' } }
  }

  const code = generateCode()
  const { data, error } = await supabase
    .from('sponsor_codes')
    .insert({ code, created_by: memberId })
    .select()
    .single()
  return { data, error }
}

export async function getMySponsorCodes(memberId) {
  const { data, error } = await supabase
    .from('sponsor_codes')
    .select('*')
    .eq('created_by', memberId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function validateSponsorCode(code) {
  const { data, error } = await supabase
    .from('sponsor_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('is_used', false)
    .single()
  if (error || !data) return { valid: false, error: 'Invalid or already used invite code.' }
  return { valid: true, codeData: data }
}

export async function redeemSponsorCode(code, newMemberId) {
  const { data, error } = await supabase
    .from('sponsor_codes')
    .update({ is_used: true, used_by: newMemberId, used_at: new Date().toISOString() })
    .eq('code', code.trim().toUpperCase())
    .eq('is_used', false)
    .select()
    .single()
  return { data, error }
}

// ── Transactions ────────────────────────────────────────────────────────────

export async function logTransaction({ memberId, offeredBy, hours, description, category }) {
  const { data, error } = await supabase
    .from('transactions')
    .insert({
      member_id: memberId,
      offered_by: offeredBy,
      hours,
      description,
      category,
      verified: false,
      status: 'pending',
    })
    .select()
    .single()
  return { data, error }
}

export async function getTransactionsForMember(memberId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('member_id', memberId)
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function getPendingVerifications(memberId) {
  // Transactions offered BY this member that are pending verification
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('offered_by', memberId)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
  return { data, error }
}

export async function verifyTransaction(transactionId, verifierId, scoreAwarded) {
  const { data, error } = await supabase
    .from('transactions')
    .update({
      verified: true,
      verified_by: verifierId,
      verified_at: new Date().toISOString(),
      score_awarded: scoreAwarded,
      status: 'verified',
    })
    .eq('id', transactionId)
    .select()
    .single()
  return { data, error }
}

export async function rejectTransaction(transactionId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'rejected' })
    .eq('id', transactionId)
    .select()
    .single()
  return { data, error }
}
