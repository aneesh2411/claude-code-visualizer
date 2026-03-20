'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

type McpNodeData = Node<{ label: string; color?: string }>;

export default function McpNode({ data }: NodeProps<McpNodeData>) {
  return (
    <div
      className="rounded-md border-2 px-3 py-2 text-sm font-medium shadow-sm bg-white"
      style={{ borderColor: '#06b6d4', minWidth: 120 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-2 h-2 rounded-full mr-1"
          style={{ background: '#06b6d4' }}
        />
        <span className="text-cyan-600 truncate max-w-[140px]">
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
