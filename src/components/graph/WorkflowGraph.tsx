'use client';

import { useState, useCallback, useMemo, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ConfigNode from './nodes/ConfigNode';
import McpNode from './nodes/McpNode';
import AgentNode from './nodes/AgentNode';
import SkillNode from './nodes/SkillNode';
import HookNode from './nodes/HookNode';
import CommandNode from './nodes/CommandNode';
import GraphLegend from './GraphLegend';
import NodeDetailPanel from './NodeDetailPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: Record<string, ComponentType<any>> = {
  config: ConfigNode,
  mcp: McpNode,
  agent: AgentNode,
  skill: SkillNode,
  hook: HookNode,
  command: CommandNode,
};

interface WorkflowGraphProps {
  nodes: Node[];
  edges: Edge[];
  loading?: boolean;
}

function GraphInner({ nodes, edges, loading }: WorkflowGraphProps) {
  const [selectedNode, setSelectedNode] = useState<Node<Record<string, unknown>> | null>(null);

  const memoNodes = useMemo(() => nodes, [nodes]);
  const memoEdges = useMemo(() => edges, [edges]);

  const handleNodeClick = useCallback<NodeMouseHandler>((_, node) => {
    setSelectedNode(node as Node<Record<string, unknown>>);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: '#111827' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm" style={{ color: '#6b7280' }}>Parsing config...</p>
        </div>
      </div>
    );
  }

  if (memoNodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: '#111827' }}>
        <div className="flex flex-col items-center gap-3 text-center px-8">
          <span className="text-4xl">🗺️</span>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            Upload a config file to visualize your Claude Code workflow
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={memoNodes}
        edges={memoEdges}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: '#111827' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          color="#374151"
          gap={24}
          size={1}
        />
        <Controls
          style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: 8 }}
        />
        <MiniMap
          style={{ background: '#1f2937', border: '1px solid #374151' }}
          nodeColor={(n) => {
            const colors: Record<string, string> = {
              config: '#9333ea', mcp: '#3b82f6', agent: '#22c55e',
              skill: '#eab308', hook: '#f97316', command: '#ef4444',
            };
            return colors[n.type ?? ''] ?? '#6b7280';
          }}
          maskColor="#111827aa"
        />
        <GraphLegend />
      </ReactFlow>

      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  );
}

export default function WorkflowGraph(props: WorkflowGraphProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
