import type { ParsedConfig } from '@/types';

export const SYSTEM_PROMPT = `You are an expert Claude Code configuration reviewer. You analyze MCP servers, agents, hooks, skills, and commands defined in Claude Code configuration files (.claude.json, CLAUDE.md, settings.json) to provide actionable improvement suggestions.

Your analysis covers:
- Security: hardcoded secrets, overly broad permissions, exposed API keys
- Performance: suboptimal model selection, poor context management strategies
- Structure: missing environment variables, unclear naming, disorganized configs
- Missing: MCPs for detected use cases, skills for detected patterns
- Redundant: conflicting or duplicate hooks, overlapping agent definitions

You must respond ONLY with valid JSON — no prose, no markdown fences, no explanation outside the JSON object.`;

export const RESPONSE_SCHEMA_DESCRIPTION = `Return ONLY valid JSON matching this exact schema:
{
  "suggestions": [
    {
      "id": "string (uuid-like, e.g. sug-001)",
      "priority": "critical|high|medium|low",
      "category": "security|performance|structure|missing|redundant",
      "title": "string (short, actionable title)",
      "description": "string (clear explanation of the issue and why it matters)",
      "fix": "optional string (concrete fix or example)",
      "affectedNodeIds": ["optional", "array", "of", "node", "ids"]
    }
  ]
}`;

function summarizeConfig(config: ParsedConfig): string {
  const countByType = config.nodes.reduce<Record<string, number>>((acc, node) => {
    return { ...acc, [node.type]: (acc[node.type] ?? 0) + 1 };
  }, {});

  const nodeList = config.nodes
    .map((n) => `  - [${n.type}] id="${n.id}" label="${n.label}"`)
    .join('\n');

  const rawSnippet = config.rawContent.length > 0
    ? `\nRaw content (first 2000 chars):\n\`\`\`\n${config.rawContent.slice(0, 2000)}\n\`\`\``
    : '';

  return `File: ${config.sourceFile}
Node counts: ${JSON.stringify(countByType)}
Nodes:
${nodeList}${rawSnippet}`;
}

export function buildUserPrompt(parsedConfigs: ParsedConfig[]): string {
  const configSummaries = parsedConfigs.map(summarizeConfig).join('\n\n---\n\n');

  return `Analyze the following Claude Code configuration(s) and return improvement suggestions.

${configSummaries}

${RESPONSE_SCHEMA_DESCRIPTION}

Provide between 1 and 10 suggestions, ordered by priority (critical first). Only include suggestions that are genuinely applicable based on the config content above.`;
}
