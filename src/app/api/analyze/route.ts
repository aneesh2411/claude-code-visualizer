import { NextRequest, NextResponse } from 'next/server';
import type { ParsedConfig } from '@/types';
import { analyzeConfig } from '../../../lib/claude/analyzer';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null || !('parsedConfigs' in body)) {
      return NextResponse.json(
        { success: false, error: 'Request body must include parsedConfigs array' },
        { status: 400 }
      );
    }

    const { parsedConfigs } = body as { parsedConfigs: unknown };

    if (!Array.isArray(parsedConfigs)) {
      return NextResponse.json(
        { success: false, error: 'parsedConfigs must be an array' },
        { status: 400 }
      );
    }

    const suggestions = await analyzeConfig(parsedConfigs as ParsedConfig[]);

    return NextResponse.json({ success: true, data: { suggestions } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('POST /api/analyze error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
