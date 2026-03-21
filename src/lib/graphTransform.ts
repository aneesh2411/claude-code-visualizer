import type { Node, Edge } from '@xyflow/react';
import type { ParsedConfig, ConfigNode, NodeType } from '../types';

export const NODE_COLORS: Record<NodeType, string> = {
  config: '#9333ea',
  mcp: '#3b82f6',
  agent: '#22c55e',
  skill: '#eab308',
  hook: '#f97316',
  command: '#ef4444',
};

// Hierarchy layers: 0=top, 1=middle, 2=bottom
const NODE_LAYER: Record<NodeType, number> = {
  config: 0,
  mcp: 1,
  agent: 1,
  hook: 2,
  skill: 2,
  command: 2,
};

const LAYER_Y: Record<number, number> = { 0: 0, 1: 220, 2: 440 };
const H_SPACING = 220;

function computePositions(nodes: ConfigNode[]): Map<string, { x: number; y: number }> {
  // Group node ids by layer
  const byLayer = new Map<number, string[]>();
  for (const node of nodes) {
    const layer = NODE_LAYER[node.type] ?? 1;
    const existing = byLayer.get(layer) ?? [];
    byLayer.set(layer, [...existing, node.id]);
  }

  const positions = new Map<string, { x: number; y: number }>();
  for (const [layer, ids] of byLayer.entries()) {
    const y = LAYER_Y[layer] ?? layer * 220;
    ids.forEach((id, i) => {
      const x = (i - (ids.length - 1) / 2) * H_SPACING;
      positions.set(id, { x, y });
    });
  }
  return positions;
}

function configNodeToFlowNode(
  configNode: ConfigNode,
  position: { x: number; y: number }
): Node<Record<string, unknown>> {
  return {
    id: configNode.id,
    type: configNode.type,
    position,
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
  const positions = computePositions(allConfigNodes);
  const nodes = allConfigNodes.map((n) =>
    configNodeToFlowNode(n, positions.get(n.id) ?? { x: 0, y: 0 })
  );

  const edges: Edge[] = configs.flatMap((c) =>
    c.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      label: e.label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#4b5563', strokeWidth: 1.5 },
      labelStyle: { fill: '#9ca3af', fontSize: 11 },
      labelBgStyle: { fill: '#1f2937', fillOpacity: 0.8 },
    }))
  );

  return { nodes, edges };
}
