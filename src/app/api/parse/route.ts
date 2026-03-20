import { NextRequest, NextResponse } from 'next/server';
import { parseConfig } from '../../../lib/parsers';
import type { FileEntry } from '../../../lib/parsers';

async function parseMultipart(request: NextRequest): Promise<FileEntry[]> {
  const formData = await request.formData();
  const entries: FileEntry[] = [];

  for (const [, value] of formData.entries()) {
    if (value instanceof File) {
      const content = await value.text();
      entries.push({ name: value.name, content });
    }
  }

  return entries;
}

async function parseJson(request: NextRequest): Promise<FileEntry[]> {
  const body = await request.json() as { files?: FileEntry[] };
  if (!Array.isArray(body.files)) {
    throw new Error('Request body must have a "files" array');
  }
  return body.files;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') ?? '';
    let files: FileEntry[];

    if (contentType.includes('multipart/form-data')) {
      files = await parseMultipart(request);
    } else {
      files = await parseJson(request);
    }

    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No recognizable config files provided' },
        { status: 400 },
      );
    }

    const parsed = parseConfig(files);

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
