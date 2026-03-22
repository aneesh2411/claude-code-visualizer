'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type ConfigNodeData = Node<{ label: string; color?: string; highlighted?: boolean }>;

export default function ConfigNode({ data, selected }: NodeProps<ConfigNodeData>) {
  return <BaseNode label={data.label} color="#9333ea" icon="📄" selected={selected} highlighted={!!data.highlighted} />;
}
