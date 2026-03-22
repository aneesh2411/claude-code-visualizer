'use client';

import { type NodeProps, type Node } from '@xyflow/react';
import BaseNode from './BaseNode';

type SkillNodeData = Node<{ label: string; color?: string; highlighted?: boolean }>;

export default function SkillNode({ data, selected }: NodeProps<SkillNodeData>) {
  return <BaseNode label={data.label} color="#eab308" icon="⚡" selected={selected} highlighted={!!data.highlighted} />;
}
