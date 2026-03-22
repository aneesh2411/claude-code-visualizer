'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type AgentNodeData = Node<{ label: string; color?: string; highlighted?: boolean }>;

export default function AgentNode({ data, selected }: NodeProps<AgentNodeData>) {
  return <BaseNode label={data.label} color="#22c55e" icon="🤖" selected={selected} highlighted={!!data.highlighted} />;
}
