import type { ParsedConfig, Suggestion } from '@/types';
import { getAnthropicClient } from './client';
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts';

const MODEL = 'claude-sonnet-4-6';
const MAX_TOKENS = 2048;

function isValidPriority(value: unknown): value is Suggestion['priority'] {
  return value === 'critical' || value === 'high' || value === 'medium' || value === 'low';
}

function isValidCategory(value: unknown): value is Suggestion['category'] {
  return (
    value === 'security' ||
    value === 'performance' ||
    value === 'structure' ||
    value === 'missing' ||
    value === 'redundant'
  );
}

function isValidSuggestion(raw: unknown): raw is Suggestion {
  if (typeof raw !== 'object' || raw === null) return false;
  const s = raw as Record<string, unknown>;
  return (
    typeof s['id'] === 'string' &&
    isValidPriority(s['priority']) &&
    isValidCategory(s['category']) &&
    typeof s['title'] === 'string' &&
    typeof s['description'] === 'string'
  );
}

function parseResponseText(text: string): Suggestion[] {
  const parsed: unknown = JSON.parse(text);
  if (typeof parsed !== 'object' || parsed === null) return [];

  const obj = parsed as Record<string, unknown>;
  const rawSuggestions = obj['suggestions'];
  if (!Array.isArray(rawSuggestions)) return [];

  return rawSuggestions.filter(isValidSuggestion);
}

export async function analyzeConfig(parsedConfigs: ParsedConfig[]): Promise<Suggestion[]> {
  try {
    const client = getAnthropicClient();
    const userPrompt = buildUserPrompt(parsedConfigs);

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const textBlock = message.content.find((block) => block.type === 'text');
    if (!textBlock || textBlock.type !== 'text') {
      console.error('analyzeConfig: no text block in response');
      return [];
    }

    return parseResponseText(textBlock.text);
  } catch (error) {
    console.error('analyzeConfig error:', error);
    return [];
  }
}
