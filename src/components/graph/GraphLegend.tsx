'use client';

import { Panel } from '@xyflow/react';

const LEGEND_ITEMS = [
  { type: 'Config', color: '#9333ea', icon: '📄' },
  { type: 'MCP', color: '#3b82f6', icon: '🔌' },
  { type: 'Agent', color: '#22c55e', icon: '🤖' },
  { type: 'Skill', color: '#eab308', icon: '⚡' },
  { type: 'Hook', color: '#f97316', icon: '🪝' },
  { type: 'Command', color: '#ef4444', icon: '/' },
] as const;

export default function GraphLegend() {
  return (
    <Panel position="bottom-left">
      <div
        style={{ background: '#111827', border: '1px solid #374151' }}
        className="rounded-lg px-3 py-2 flex flex-wrap gap-2 max-w-xs"
      >
        {LEGEND_ITEMS.map(({ type, color, icon }) => (
          <div key={type} className="flex items-center gap-1.5">
            <span
              className="inline-block w-2 h-2 rounded-full shrink-0"
              style={{ background: color }}
            />
            <span className="text-xs" style={{ color: '#9ca3af' }}>
              {icon} {type}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}
