'use client';

import type { Node } from '@xyflow/react';
import type { NodeType } from '../../types';
import { NODE_COLORS } from '../../lib/graphTransform';

interface NodeDetailPanelProps {
  node: Node<Record<string, unknown>>;
  onClose: () => void;
}

const NODE_LABELS: Record<NodeType, string> = {
  config: 'Config File',
  mcp: 'MCP Server',
  agent: 'Agent',
  skill: 'Skill',
  hook: 'Hook',
  command: 'Command',
};

const NODE_DESCRIPTIONS: Record<NodeType, string> = {
  config: 'Top-level configuration file that defines your Claude Code workspace.',
  mcp: 'Model Context Protocol server that exposes tools and resources to Claude.',
  agent: 'Specialized subagent with a focused role and capability set.',
  skill: 'Reusable workflow pattern that can be invoked via slash commands.',
  hook: 'Lifecycle hook that fires automatically before or after tool execution.',
  command: 'Custom slash command available in the Claude Code session.',
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>{label}</span>
      <span className="text-sm break-words" style={{ color: '#e5e7eb' }}>{value}</span>
    </div>
  );
}

function CodeBlock({ value }: { value: string }) {
  return (
    <pre
      className="text-xs rounded p-2 overflow-x-auto"
      style={{ background: '#0f172a', color: '#94a3b8', fontFamily: 'monospace' }}
    >
      {value}
    </pre>
  );
}

function ConfigDetails({ data }: { data: Record<string, unknown> }) {
  const source = data['source'] as string | undefined;
  const projectCount = data['projectCount'] as number | undefined;
  const allow = data['permissionsAllow'] as string[] | undefined;
  const deny = data['permissionsDeny'] as string[] | undefined;
  const tools = data['allowedTools'] as string[] | undefined;
  const error = data['error'] as string | undefined;

  if (error) return <Row label="Error" value={error} />;

  return (
    <>
      {source && <Row label="Source" value={source} />}
      {projectCount !== undefined && <Row label="Projects" value={String(projectCount)} />}
      {allow && allow.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Allowed permissions</span>
          <div className="flex flex-wrap gap-1">
            {allow.map((t) => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#14532d', color: '#86efac' }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {deny && deny.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Denied permissions</span>
          <div className="flex flex-wrap gap-1">
            {deny.map((t) => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#450a0a', color: '#fca5a5' }}>{t}</span>
            ))}
          </div>
        </div>
      )}
      {tools && tools.length > 0 && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Allowed tools</span>
          <div className="flex flex-wrap gap-1">
            {tools.slice(0, 12).map((t) => (
              <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1e3a5f', color: '#93c5fd' }}>{t}</span>
            ))}
            {tools.length > 12 && (
              <span className="text-xs" style={{ color: '#6b7280' }}>+{tools.length - 12} more</span>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function McpDetails({ data }: { data: Record<string, unknown> }) {
  const config = data['config'] as Record<string, unknown> | undefined;
  const source = data['source'] as string | undefined;

  return (
    <>
      {source && <Row label="Source" value={source} />}
      {config && (
        <>
          {typeof config['command'] === 'string' && <Row label="Command" value={config['command']} />}
          {typeof config['type'] === 'string' && <Row label="Transport" value={config['type']} />}
          {Array.isArray(config['args']) && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Args</span>
              <CodeBlock value={(config['args'] as string[]).join(' ')} />
            </div>
          )}
          {config['env'] && typeof config['env'] === 'object' && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Env vars</span>
              <div className="flex flex-wrap gap-1">
                {Object.keys(config['env'] as object).map((k) => (
                  <span key={k} className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ background: '#1c1c2e', color: '#a5b4fc' }}>{k}</span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
      <div className="rounded p-2 text-xs" style={{ background: '#1c1917', color: '#a8a29e', borderLeft: '2px solid #f97316' }}>
        Each MCP server adds context to every request. Keep only servers you actively use to protect your context window.
      </div>
    </>
  );
}

function HookDetails({ data }: { data: Record<string, unknown> }) {
  const hookType = data['hookType'] as string | undefined;
  const config = data['config'] as Record<string, unknown> | undefined;

  const hookDescriptions: Record<string, string> = {
    PreToolUse: 'Fires before a tool is called. Can validate or block execution.',
    PostToolUse: 'Fires after a tool completes. Useful for formatting or logging.',
    Stop: 'Fires when the Claude Code session ends.',
  };

  return (
    <>
      {hookType && (
        <>
          <Row label="Hook type" value={hookType} />
          <div className="rounded p-2 text-xs" style={{ background: '#1c1917', color: '#a8a29e', borderLeft: '2px solid #f97316' }}>
            {hookDescriptions[hookType] ?? 'Custom hook.'}
          </div>
        </>
      )}
      {config && typeof config['command'] === 'string' && (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs uppercase tracking-wide" style={{ color: '#6b7280' }}>Command</span>
          <CodeBlock value={config['command']} />
        </div>
      )}
    </>
  );
}

function GenericDetails({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data).filter(
    ([k, v]) => k !== 'label' && k !== 'color' && typeof v !== 'object'
  );
  if (entries.length === 0) return <p className="text-xs" style={{ color: '#6b7280' }}>No additional data available.</p>;
  return (
    <>
      {entries.map(([k, v]) => (
        <Row key={k} label={k} value={String(v)} />
      ))}
    </>
  );
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  const nodeType = (node.type ?? 'config') as NodeType;
  const color = NODE_COLORS[nodeType] ?? '#888';
  const label = (node.data['label'] as string | undefined) ?? node.id;
  const data = node.data;

  return (
    <div
      style={{
        position: 'absolute',
        top: 12,
        right: 12,
        width: 300,
        zIndex: 10,
        background: '#1f2937',
        border: `1px solid ${color}44`,
        borderRadius: 10,
        boxShadow: `0 0 24px ${color}22`,
        overflow: 'hidden',
        maxHeight: 'calc(100% - 24px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <div
        style={{ background: `${color}22`, borderBottom: `1px solid ${color}44` }}
        className="flex items-start justify-between px-4 py-3 shrink-0"
      >
        <div>
          <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color }}>
            {NODE_LABELS[nodeType]}
          </p>
          <p className="text-sm font-semibold" style={{ color: '#f3f4f6' }}>{label}</p>
        </div>
        <button
          onClick={onClose}
          className="text-lg leading-none ml-2 shrink-0"
          style={{ color: '#6b7280' }}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Description */}
      <p className="px-4 pt-3 pb-0 text-xs" style={{ color: '#9ca3af' }}>
        {NODE_DESCRIPTIONS[nodeType]}
      </p>

      {/* Details */}
      <div className="px-4 py-3 flex flex-col gap-3 overflow-y-auto">
        {nodeType === 'config' && <ConfigDetails data={data} />}
        {nodeType === 'mcp' && <McpDetails data={data} />}
        {nodeType === 'hook' && <HookDetails data={data} />}
        {(nodeType === 'agent' || nodeType === 'skill' || nodeType === 'command') && (
          <GenericDetails data={data} />
        )}
      </div>
    </div>
  );
}
