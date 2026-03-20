'use client';

import { useState } from 'react';
import type { Suggestion } from '../../types';

interface SuggestionCardProps {
  suggestion: Suggestion;
}

const PRIORITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-blue-100 text-blue-700',
};

export default function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const priorityStyle = PRIORITY_STYLES[suggestion.priority] ?? 'bg-gray-100 text-gray-600';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
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
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? 'Hide fix' : 'Show fix'}
          </button>
          {expanded && (
            <pre className="mt-2 rounded bg-gray-50 border border-gray-200 p-2 text-xs overflow-x-auto whitespace-pre-wrap font-mono">
              {suggestion.fix}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
