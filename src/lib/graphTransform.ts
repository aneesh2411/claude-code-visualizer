import type { Node, Edge } from '@xyflow/react';
import type { ParsedConfig, ConfigNode } from '../types';

const NODE_COLORS: Record<string, string> = {
  config: '#6366f1',
  mcp: '#06b6d4',
  agent: '#8b5cf6',
  skill: '#10b981',
  hook: '#f59e0b',
  command: '#ef4444',
};

function configNodeToFlowNode(
  configNode: ConfigNode,
  index: number
): Node<Record<string, unknown>> {
  const x = (index % 4) * 200;
  const y = Math.floor(index / 4) * 120;
  return {
    id: configNode.id,
    type: configNode.type,
    position: { x, y },
    data: {
      ...configNode.data,
      label: configNode.label,
      color: NODE_COLORS[configNode.type] ?? '#888888',
    },
  };
}

export function transformToFlowNodes(
  configs: ParsedConfig[]
): { nodes: Node<Record<string, unknown>>[]; edges: Edge[] } {
  const allConfigNodes: ConfigNode[] = configs.flatMap((c) => c.nodes);
  const nodes = allConfigNodes.map((n, i) => configNodeToFlowNode(n, i));

  const edges: Edge[] = configs.flatMap((c) =>
    c.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
    }))
  );

  return { nodes, edges };
}
