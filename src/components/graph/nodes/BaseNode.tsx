'use client';

import { Handle, Position } from '@xyflow/react';

interface BaseNodeProps {
  label: string;
  color: string;
  icon: string;
  selected?: boolean;
}

export default function BaseNode({ label, color, icon, selected }: BaseNodeProps) {
  return (
    <div
      style={{
        borderColor: color,
        boxShadow: selected ? `0 0 0 2px ${color}, 0 0 12px ${color}55` : undefined,
        minWidth: 140,
        background: '#1f2937',
      }}
      className="rounded-md border-2 px-3 py-2 text-sm font-medium transition-shadow"
    >
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none' }} />
      <div className="flex items-center gap-1.5">
        <span className="text-base leading-none">{icon}</span>
        <span
          className="truncate max-w-[140px]"
          style={{ color }}
          title={label}
        >
          {label}
        </span>
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none' }} />
    </div>
  );
}
