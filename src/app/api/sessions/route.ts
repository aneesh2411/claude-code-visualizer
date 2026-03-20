import { NextRequest, NextResponse } from 'next/server';
import { listSessions, createSession } from '../../../lib/supabase/sessions';

export async function GET(): Promise<NextResponse> {
  try {
    const sessions = await listSessions();
    return NextResponse.json({ success: true, data: sessions });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as { name?: string; configFiles?: Record<string, string> };

    if (!body.name || typeof body.name !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: name' },
        { status: 400 },
      );
    }

    if (!body.configFiles || typeof body.configFiles !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Missing required field: configFiles' },
        { status: 400 },
      );
    }

    const session = await createSession(body.name, body.configFiles);
    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
