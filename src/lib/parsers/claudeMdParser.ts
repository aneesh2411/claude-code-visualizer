import matter from 'gray-matter';
import type { ParsedConfig, ConfigNode, ConfigEdge } from '../../types';

function makeId(prefix: string, label: string): string {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

function extractMcps(content: string): ConfigNode[] {
  const nodes: ConfigNode[] = [];
  const seen = new Set<string>();

  // Match MCP server names from section headers, mcp-servers/mcpServers keys, and code blocks
  const patterns = [
    /##\s+MCPs?\b([\s\S]*?)(?=\n##|\n#|$)/gi,
    /mcp[-_]?servers?\s*[:\-]\s*([^\n]+)/gi,
    /mcpServers\s*[:\{]/gi,
  ];

  // Extract from MCP sections
  const mcpSectionRegex = /##\s+MCPs?\b([\s\S]*?)(?=\n##\s|\n#\s|$)/i;
  const mcpSection = content.match(mcpSectionRegex);
  if (mcpSection) {
    const section = mcpSection[1];
    // Look for list items or code block entries
    const listItems = section.match(/[-*]\s+`?([a-zA-Z0-9_\-@/]+)`?/g) || [];
    for (const item of listItems) {
      const name = item.replace(/[-*]\s+`?/, '').replace(/`$/, '').trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        nodes.push({ id: makeId('mcp', name), type: 'mcp', label: name, data: { source: 'CLAUDE.md' } });
      }
    }
  }

  // Extract from mcp-servers or mcpServers patterns
  const serverLineRegex = /(?:mcp[-_]?servers?|mcpServers)\s*[:\-]\s*([^\n]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = serverLineRegex.exec(content)) !== null) {
    const name = match[1].trim().replace(/["`']/g, '');
    if (name && !seen.has(name)) {
      seen.add(name);
      nodes.push({ id: makeId('mcp', name), type: 'mcp', label: name, data: { source: 'CLAUDE.md' } });
    }
  }

  // Ignore patterns[2] (mcpServers block) - handled structurally in settingsJsonParser
  void patterns;

  return nodes;
}

function extractAgents(content: string): ConfigNode[] {
  const nodes: ConfigNode[] = [];
  const seen = new Set<string>();

  // Match `agent: name`, `agent:name`, subagent references, and agent tables
  const agentPatterns = [
    /\bagent\s*:\s*["`']?([a-zA-Z0-9_\-]+)["`']?/gi,
    /\bsubagent\s+["`']?([a-zA-Z0-9_\-]+)["`']?/gi,
    /\|\s*([a-zA-Z0-9_\-]+)\s*\|\s*[A-Z][^|]+\|/g,
  ];

  for (const pattern of agentPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const name = match[1].trim();
      if (name && !seen.has(name)) {
        seen.add(name);
        nodes.push({ id: makeId('agent', name), type: 'agent', label: name, data: { source: 'CLAUDE.md' } });
      }
    }
  }

  return nodes;
}

function extractSkills(content: string): ConfigNode[] {
  const nodes: ConfigNode[] = [];
  const seen = new Set<string>();

  const skillRegex = /\bskill\s*:\s*([a-zA-Z0-9_\-]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = skillRegex.exec(content)) !== null) {
    const name = match[1].trim();
    if (name && !seen.has(name)) {
      seen.add(name);
      nodes.push({ id: makeId('skill', name), type: 'skill', label: name, data: { source: 'CLAUDE.md' } });
    }
  }

  return nodes;
}

function extractHooks(content: string): ConfigNode[] {
  const nodes: ConfigNode[] = [];
  const seen = new Set<string>();

  const hookKeywords = ['PreToolUse', 'PostToolUse', 'Stop'];
  for (const keyword of hookKeywords) {
    if (content.includes(keyword) && !seen.has(keyword)) {
      seen.add(keyword);
      nodes.push({ id: makeId('hook', keyword), type: 'hook', label: keyword, data: { source: 'CLAUDE.md' } });
    }
  }

  return nodes;
}

function buildEdges(rootId: string, nodes: ConfigNode[]): ConfigEdge[] {
  return nodes.map((node) => ({
    id: `${rootId}->${node.id}`,
    source: rootId,
    target: node.id,
  }));
}

export function parseClaudeMd(content: string): ParsedConfig {
  try {
    const parsed = matter(content);
    const body = parsed.content;

    const rootNode: ConfigNode = {
      id: 'config-claude-md',
      type: 'config',
      label: 'CLAUDE.md',
      data: { frontmatter: parsed.data },
    };

    const mcpNodes = extractMcps(body);
    const agentNodes = extractAgents(body);
    const skillNodes = extractSkills(body);
    const hookNodes = extractHooks(body);

    const childNodes = [...mcpNodes, ...agentNodes, ...skillNodes, ...hookNodes];
    const edges = buildEdges(rootNode.id, childNodes);

    return {
      nodes: [rootNode, ...childNodes],
      edges,
      sourceFile: 'CLAUDE.md',
      rawContent: content,
    };
  } catch {
    return {
      nodes: [{ id: 'config-claude-md', type: 'config', label: 'CLAUDE.md', data: {} }],
      edges: [],
      sourceFile: 'CLAUDE.md',
      rawContent: content,
    };
  }
}
