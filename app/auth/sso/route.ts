import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

export const runtime = 'nodejs'

const SSO_SECRET = new TextEncoder().encode(process.env.SSO_SECRET ?? '')
const SESSION_COOKIE = 'canal_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours

// role mapping: cdr-landing sends 'superadmin' | 'admin' | 'manager'
const ROLE_REDIRECTS: Record<string, string> = {
  superadmin: '/superadmin',
  admin: '/events',
  manager: '/submit',
}

function buildSession(uid: string, nombre: string, role: string) {
  return btoa(JSON.stringify({ uid, nombre, role, exp: Date.now() + SESSION_TTL_MS }))
}

// GET /auth/sso?token=xxx&redirect=/superadmin
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const token = searchParams.get('token')
  const redirectParam = searchParams.get('redirect')

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { payload } = await jwtVerify(token, SSO_SECRET)

    const role = (payload.role ?? payload.rol ?? 'manager') as string
    const nombre = (payload.nombre ?? '') as string
    const uid = (payload.uid ?? '') as string

    // Always route by role — ignore redirect param to avoid CDR sending wrong paths
    const destination = ROLE_REDIRECTS[role] ?? '/submit'
    const res = NextResponse.redirect(new URL(destination, req.url))

    res.cookies.set(SESSION_COOKIE, buildSession(uid, nombre, role), {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_MS / 1000,
      secure: process.env.NODE_ENV === 'production',
    })

    return res
  } catch (err) {
    console.error('[canal sso]', err)
    const cdrUrl = process.env.CDR_URL ?? 'https://cdr-landing-ruddy.vercel.app'
    return NextResponse.redirect(new URL(cdrUrl))
  }
}
