'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type McpNodeData = Node<{ label: string; color?: string }>;

export default function McpNode({ data, selected }: NodeProps<McpNodeData>) {
  return <BaseNode label={data.label} color="#3b82f6" icon="🔌" selected={selected} />;
}
