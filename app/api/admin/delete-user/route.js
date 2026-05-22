import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function DELETE(req) {
  const authHeader = req.headers.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized. Missing token.' },
      { status: 401 }
    )
  }

  const token = authHeader.replace('Bearer ', '').trim()

  const {
    data: { user: caller },
    error: callerError,
  } = await supabaseAdmin.auth.getUser(token)

  if (callerError || !caller) {
    return NextResponse.json(
      { error: 'Unauthorized. Invalid session.' },
      { status: 401 }
    )
  }

  const { data: callerProfile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', caller.id)
    .maybeSingle()

  if (callerProfile?.role !== 'admin') {
    return NextResponse.json(
      { error: 'Admin access required.' },
      { status: 403 }
    )
  }

  const { userId } = await req.json()

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required.' },
      { status: 400 }
    )
  }

  if (userId === caller.id) {
    return NextResponse.json(
      { error: 'You cannot delete your own admin account.' },
      { status: 400 }
    )
  }

  await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', userId)

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }

  return NextResponse.json({ success: true })
}