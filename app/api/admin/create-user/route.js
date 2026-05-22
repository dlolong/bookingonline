import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized. Missing token.' },
      { status: 401 }
    )
  }

  const token = authHeader.replace('Bearer ', '').trim()

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized. Missing token.' },
      { status: 401 }
    )
  }

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token)

  if (userError || !user) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid session.' },
      { status: 401 }
    )
  }

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required.' },
      { status: 403 }
    )
  }

  const { email, password, role = 'user', plan = 'free' } = await req.json()

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Email and password are required.' },
      { status: 400 }
    )
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  await supabaseAdmin.from('profiles').upsert({
    id: data.user.id,
    email,
    role,
    plan,
    subscription_status: plan === 'pro' ? 'active' : 'inactive',
    subscription_started_at: plan === 'pro' ? new Date().toISOString() : null,
    subscription_expires_at:
      plan === 'pro'
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : null,
  })

  return NextResponse.json({ success: true })
}