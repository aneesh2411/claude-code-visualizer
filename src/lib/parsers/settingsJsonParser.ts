import type { ParsedConfig, ConfigNode, ConfigEdge } from '../../types';

function makeId(prefix: string, label: string): string {
  return `${prefix}-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

interface SettingsJson {
  mcpServers?: Record<string, unknown>;
  hooks?: Array<{ type?: string; name?: string; [key: string]: unknown }>;
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  [key: string]: unknown;
}

function parseMcpNodes(mcpServers: Record<string, unknown>): ConfigNode[] {
  return Object.keys(mcpServers).map((name) => ({
    id: makeId('mcp', name),
    type: 'mcp' as const,
    label: name,
    data: { config: mcpServers[name], source: 'settings.json' },
  }));
}

function parseHookNodes(hooks: Array<{ type?: string; name?: string; [key: string]: unknown }>): ConfigNode[] {
  return hooks.map((hook, index) => {
    const label = hook.name ?? hook.type ?? `hook-${index}`;
    return {
      id: makeId('hook', `${label}-${index}`),
      type: 'hook' as const,
      label,
      data: { hookType: hook.type, source: 'settings.json', config: hook },
    };
  });
}

function buildEdges(rootId: string, nodes: ConfigNode[]): ConfigEdge[] {
  return nodes.map((node) => ({
    id: `${rootId}->${node.id}`,
    source: rootId,
    target: node.id,
  }));
}

export function parseSettingsJson(content: string): ParsedConfig {
  const rootNode: ConfigNode = {
    id: 'config-settings-json',
    type: 'config',
    label: 'settings.json',
    data: {},
  };

  try {
    const settings = JSON.parse(content) as SettingsJson;

    const permissions = settings.permissions ?? {};
    const updatedRoot: ConfigNode = {
      ...rootNode,
      data: {
        permissionsAllow: permissions.allow ?? [],
        permissionsDeny: permissions.deny ?? [],
        source: 'settings.json',
      },
    };

    const mcpNodes = settings.mcpServers
      ? parseMcpNodes(settings.mcpServers)
      : [];

    const hookNodes =
      Array.isArray(settings.hooks) ? parseHookNodes(settings.hooks) : [];

    const childNodes = [...mcpNodes, ...hookNodes];
    const edges = buildEdges(updatedRoot.id, childNodes);

    return {
      nodes: [updatedRoot, ...childNodes],
      edges,
      sourceFile: 'settings.json',
      rawContent: content,
    };
  } catch {
    return {
      nodes: [{ ...rootNode, data: { error: 'Failed to parse JSON' } }],
      edges: [],
      sourceFile: 'settings.json',
      rawContent: content,
    };
  }
}
