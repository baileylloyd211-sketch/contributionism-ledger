import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getMembers() {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('contribution_score', { ascending: false })
  return { data, error }
}

export async function getMemberById(id) {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', id)
    .single()
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

export async function upsertMember(member) {
  const { data, error } = await supabase
    .from('members')
    .upsert(member)
    .select()
    .single()
  return { data, error }
}

export async function logTransaction(transaction) {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
    .select()
    .single()
  return { data, error }
}

export async function verifyTransaction(transactionId, verifierId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ verified: true, verified_by: verifierId, verified_at: new Date().toISOString() })
    .eq('id', transactionId)
    .select()
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

