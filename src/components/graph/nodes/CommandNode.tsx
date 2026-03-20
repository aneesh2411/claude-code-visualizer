'use client';

import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';

type CommandNodeData = Node<{ label: string; color?: string }>;

export default function CommandNode({ data }: NodeProps<CommandNodeData>) {
  return (
    <div
      className="rounded-md border-2 px-3 py-2 text-sm font-medium shadow-sm bg-white"
      style={{ borderColor: '#ef4444', minWidth: 120 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-1">
        <span
          className="inline-block w-2 h-2 rounded-full mr-1"
          style={{ background: '#ef4444' }}
        />
        <span className="text-red-600 truncate max-w-[140px]">
          {data.label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
