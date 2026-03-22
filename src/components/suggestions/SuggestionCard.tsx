'use client';

import { useState } from 'react';
import type { Suggestion } from '../../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
  onHighlight?: (ids: string[]) => void;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

export default function SuggestionCard({ suggestion, onHighlight }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [focused, setFocused] = useState(false);
  const [copied, setCopied] = useState(false);

  const priorityStyle = PRIORITY_STYLES[suggestion.priority] ?? 'bg-gray-100 text-gray-600';

  function handleCardClick() {
    const nextFocused = !focused;
    setFocused(nextFocused);
    onHighlight?.(nextFocused ? (suggestion.affectedNodeIds ?? []) : []);
  }

  async function handleCopy() {
    if (!suggestion.fix) return;
    try {
      await navigator.clipboard.writeText(suggestion.fix);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable (non-secure context)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      className={`rounded-lg border bg-white p-3 shadow-sm cursor-pointer transition-all ${
        focused ? 'border-indigo-400 ring-1 ring-indigo-400' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-2 flex-wrap">
        <span className={`text-xs font-semibold rounded px-2 py-0.5 capitalize ${priorityStyle}`}>
          {suggestion.priority}
        </span>
        <span className="text-xs rounded px-2 py-0.5 bg-gray-100 text-gray-500 capitalize">
          {suggestion.category}
        </span>
      </div>

      <p className="mt-2 text-sm font-semibold text-gray-800">{suggestion.title}</p>
      <p className="mt-1 text-sm text-gray-600">{suggestion.description}</p>

      {suggestion.fix && (
        <div className="mt-2">
          <button
            className="text-xs text-indigo-600 hover:underline"
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
          >
            {expanded ? 'Hide fix' : 'Show fix'}
          </button>
          {expanded && (
            <div className="relative mt-2">
              <button
                onClick={(e) => { e.stopPropagation(); void handleCopy(); }}
                className="absolute top-1.5 right-1.5 text-xs px-1.5 py-0.5 rounded transition-colors"
                style={{
                  background: copied ? '#14532d' : '#374151',
                  color: copied ? '#86efac' : '#9ca3af',
                }}
                title="Copy to clipboard"
              >
                {copied ? 'Copied!' : '📋'}
              </button>
              <pre className="rounded bg-gray-50 border border-gray-200 p-2 text-xs overflow-x-auto whitespace-pre-wrap font-mono pr-16">
                {suggestion.fix}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
