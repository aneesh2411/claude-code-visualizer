'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type CommandNodeData = Node<{ label: string; color?: string }>;

export default function CommandNode({ data, selected }: NodeProps<CommandNodeData>) {
  return <BaseNode label={data.label} color="#ef4444" icon="/" selected={selected} />;
}
