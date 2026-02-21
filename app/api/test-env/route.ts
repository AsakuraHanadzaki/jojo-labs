import { NextResponse } from 'next/server';

function maskPassword(password: string | undefined): string {
  if (!password) return 'MISSING';
  return `SET (${password.length} chars, first="${password[0]}", last="${password.slice(-1)}")`;
}

export async function GET() {
  const envVars = {
    ARCA_API_URL: process.env.ARCA_API_URL || 'MISSING',
    ARCA_USERNAME: process.env.ARCA_USERNAME || 'MISSING',
    ARCA_PASSWORD: maskPassword(process.env.ARCA_PASSWORD),
    ARCA_RETURN_URL: process.env.ARCA_RETURN_URL || 'MISSING',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'MISSING',
    SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    NODE_ENV: process.env.NODE_ENV || 'MISSING',
    VERCEL_ENV: process.env.VERCEL_ENV || 'MISSING',
  };

  console.log('[v0] Test ENV endpoint called. Environment variables:', JSON.stringify(envVars, null, 2));

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envVars,
  });
}
