import type { ParsedConfig, ConfigNode, ConfigEdge } from '../../types';

function makeId(prefix: string, label: string): string {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

interface ProjectEntry {
  mcpServers?: Record<string, unknown>;
  allowedTools?: string[];
  [key: string]: unknown;
}

interface DotClaudeJson {
  projects?: Record<string, ProjectEntry>;
  mcpServers?: Record<string, unknown>;
  [key: string]: unknown;
}

function parseMcpNodes(
  mcpServers: Record<string, unknown>,
  source: string,
): ConfigNode[] {
  return Object.keys(mcpServers).map((name) => ({
    id: makeId('mcp', `${source}-${name}`),
    type: 'mcp' as const,
    label: name,
    data: { config: mcpServers[name], source },
  }));
}

function buildEdges(rootId: string, nodes: ConfigNode[]): ConfigEdge[] {
  return nodes.map((node) => ({
    id: `${rootId}->${node.id}`,
    source: rootId,
    target: node.id,
  }));
}

export function parseDotClaudeJson(content: string): ParsedConfig {
  const rootNode: ConfigNode = {
    id: 'config-dot-claude-json',
    type: 'config',
    label: '.claude.json',
    data: {},
  };

  try {
    const config = JSON.parse(content) as DotClaudeJson;
    const allMcpNodes: ConfigNode[] = [];

    // Top-level mcpServers
    if (config.mcpServers && typeof config.mcpServers === 'object') {
      const nodes = parseMcpNodes(config.mcpServers, 'global');
      allMcpNodes.push(...nodes);
    }

    // Per-project mcpServers
    if (config.projects && typeof config.projects === 'object') {
      for (const [projectName, project] of Object.entries(config.projects)) {
        if (project.mcpServers && typeof project.mcpServers === 'object') {
          const nodes = parseMcpNodes(project.mcpServers, projectName);
          allMcpNodes.push(...nodes);
        }
      }
    }

    // Gather allowedTools from all projects as data on root
    const allAllowedTools: string[] = [];
    if (config.projects) {
      for (const project of Object.values(config.projects)) {
        if (Array.isArray(project.allowedTools)) {
          allAllowedTools.push(...project.allowedTools);
        }
      }
    }

    const updatedRoot: ConfigNode = {
      ...rootNode,
      data: {
        allowedTools: [...new Set(allAllowedTools)],
        projectCount: config.projects ? Object.keys(config.projects).length : 0,
        source: '.claude.json',
      },
    };

    const edges = buildEdges(updatedRoot.id, allMcpNodes);

    return {
      nodes: [updatedRoot, ...allMcpNodes],
      edges,
      sourceFile: '.claude.json',
      rawContent: content,
    };
  } catch {
    return {
      nodes: [{ ...rootNode, data: { error: 'Failed to parse JSON' } }],
      edges: [],
      sourceFile: '.claude.json',
      rawContent: content,
    };
  }
}
