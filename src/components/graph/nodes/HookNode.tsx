'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type HookNodeData = Node<{ label: string; color?: string; highlighted?: boolean }>;

export default function HookNode({ data, selected }: NodeProps<HookNodeData>) {
  return <BaseNode label={data.label} color="#f97316" icon="🪝" selected={selected} highlighted={!!data.highlighted} />;
}
