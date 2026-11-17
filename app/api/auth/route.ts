import { NextRequest, NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  createSessionToken,
  verifySessionToken,
} from '@/lib/auth';

const VALID_USERNAME = 'admin';
const VALID_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

export async function GET(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(token);

  if (!session.valid) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.username || VALID_USERNAME,
      role: 'Guru PJOK / Administrator',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { username?: string; password?: string };
    const username = (body.username || '').trim();
    const password = body.password || '';

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return NextResponse.json(
        {
          authenticated: false,
          error: 'Username atau password tidak sesuai. Silakan periksa kembali.',
        },
        { status: 401 }
      );
    }

    const token = createSessionToken(username);
    const res = NextResponse.json({
      authenticated: true,
      user: {
        username,
        role: 'Guru PJOK / Administrator',
      },
    });

    res.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json(
      { authenticated: false, error: 'Permintaan login tidak valid.' },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const res = NextResponse.json({ authenticated: false });
  res.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
