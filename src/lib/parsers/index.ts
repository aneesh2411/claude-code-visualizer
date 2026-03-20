import type { ParsedConfig } from '../../types';
import { parseClaudeMd } from './claudeMdParser';
import { parseSettingsJson } from './settingsJsonParser';
import { parseDotClaudeJson } from './dotClaudeJsonParser';

export type FileEntry = { name: string; content: string };

function detectParser(fileName: string): ((content: string) => ParsedConfig) | null {
  const base = fileName.split('/').pop() ?? fileName;

  if (base.toLowerCase() === 'claude.md') return parseClaudeMd;
  if (base === 'settings.json') return parseSettingsJson;
  if (base === '.claude.json') return parseDotClaudeJson;

  return null;
}

export function parseConfig(files: FileEntry[]): ParsedConfig[] {
  const results: ParsedConfig[] = [];

  for (const file of files) {
    const parser = detectParser(file.name);
    if (!parser) continue;

    try {
      const parsed = parser(file.content);
      results.push(parsed);
    } catch {
      // Swallow per-file errors; partial results already handled inside parsers
    }
  }

  return results;
}
