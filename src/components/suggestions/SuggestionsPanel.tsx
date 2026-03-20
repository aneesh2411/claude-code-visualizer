'use client';

import type { Suggestion } from '../../types';
import SuggestionCard from './SuggestionCard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  loading?: boolean;
}

const PRIORITY_ORDER: Suggestion['priority'][] = ['critical', 'high', 'medium', 'low'];

function sortByPriority(suggestions: Suggestion[]): Suggestion[] {
  return [...suggestions].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority)
  );
}

function groupByPriority(
  suggestions: Suggestion[]
): Map<Suggestion['priority'], Suggestion[]> {
  const map = new Map<Suggestion['priority'], Suggestion[]>();
  for (const s of suggestions) {
    const existing = map.get(s.priority) ?? [];
    map.set(s.priority, [...existing, s]);
  }
  return map;
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white p-3 animate-pulse">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-12 rounded bg-gray-200" />
          </div>
          <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
          <div className="mt-1 h-3 w-full rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

export default function SuggestionsPanel({ suggestions, loading }: SuggestionsPanelProps) {
  if (loading) return <LoadingSkeleton />;

  if (suggestions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-gray-400 text-center">
          Click Analyze to get AI suggestions
        </p>
      </div>
    );
  }

  const sorted = sortByPriority(suggestions);
  const grouped = groupByPriority(sorted);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      {PRIORITY_ORDER.map((priority) => {
        const items = grouped.get(priority);
        if (!items || items.length === 0) return null;
        return (
          <section key={priority}>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 capitalize">
              {priority}
            </h3>
            <div className="flex flex-col gap-2">
              {items.map((s) => (
                <SuggestionCard key={s.id} suggestion={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
