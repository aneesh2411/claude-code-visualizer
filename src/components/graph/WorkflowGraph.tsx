'use client';

import { useMemo, type ComponentType } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import ConfigNode from './nodes/ConfigNode';
import McpNode from './nodes/McpNode';
import AgentNode from './nodes/AgentNode';
import SkillNode from './nodes/SkillNode';
import HookNode from './nodes/HookNode';
import CommandNode from './nodes/CommandNode';

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
  const memoNodes = useMemo(() => nodes, [nodes]);
  const memoEdges = useMemo(() => edges, [edges]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-500">Parsing config...</p>
        </div>
      </div>
    );
  }

  if (memoNodes.length === 0) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-50">
        <p className="text-gray-400 text-sm">
          Upload a config file to see your workflow
        </p>
      </div>
    );
  }

  return (
    <ReactFlow
      nodes={memoNodes}
      edges={memoEdges}
      nodeTypes={nodeTypes}
      fitView
      className="bg-gray-50"
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}

export default function WorkflowGraph(props: WorkflowGraphProps) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
