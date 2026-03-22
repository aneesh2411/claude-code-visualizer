'use client';

import type { Suggestion } from '../../types';
import SuggestionCard from './SuggestionCard';

interface SuggestionsPanelProps {
  suggestions: Suggestion[];
  loading?: boolean;
  onHighlight?: (ids: string[]) => void;
}

const PRIORITY_ORDER: Suggestion['priority'][] = ['critical', 'high', 'medium', 'low'];

const PRIORITY_PENALTIES: Record<Suggestion['priority'], number> = {
  critical: 25,
  high: 15,
  medium: 8,
  low: 3,
};

function computeHealthScore(suggestions: Suggestion[]): number {
  const total = suggestions.reduce((sum, s) => sum + (PRIORITY_PENALTIES[s.priority] ?? 0), 0);
  return Math.max(0, 100 - total);
}

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

function HealthScoreDisplay({ score }: { score: number }) {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const label = score >= 80 ? 'Healthy' : score >= 60 ? 'Needs Attention' : 'Critical Issues';

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center mb-4">
      <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">Config Health</p>
      <p className="text-5xl font-bold tabular-nums" style={{ color }}>{score}</p>
      <p className="text-sm font-medium mt-1" style={{ color }}>{label}</p>
      <div className="mt-3 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${score}%`, background: color }}
        />
      </div>
    </div>
  );
}

const TOP_ISSUE_PRIORITY_COLORS: Record<Suggestion['priority'], { bg: string; text: string; dot: string }> = {
  critical: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444' },
  high: { bg: '#fff7ed', text: '#9a3412', dot: '#f97316' },
  medium: { bg: '#fefce8', text: '#854d0e', dot: '#eab308' },
  low: { bg: '#eff6ff', text: '#1e40af', dot: '#3b82f6' },
};

function TopIssues({ issues }: { issues: Suggestion[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="mb-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
        Top Issues
      </h3>
      <div className="flex flex-col gap-2">
        {issues.map((s) => {
          const styles = TOP_ISSUE_PRIORITY_COLORS[s.priority];
          return (
            <div
              key={s.id}
              className="rounded-md px-3 py-2 flex items-start gap-2"
              style={{ background: styles.bg }}
            >
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0 mt-1"
                style={{ background: styles.dot }}
              />
              <div>
                <p className="text-xs font-semibold" style={{ color: styles.text }}>{s.title}</p>
                <p className="text-xs mt-0.5" style={{ color: styles.text, opacity: 0.8 }}>
                  {s.description.length > 80 ? s.description.slice(0, 80) + '…' : s.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SuggestionsPanel({ suggestions, loading, onHighlight }: SuggestionsPanelProps) {
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

  const score = computeHealthScore(suggestions);
  const sorted = sortByPriority(suggestions);
  const grouped = groupByPriority(sorted);
  const topIssues = sorted.slice(0, 3);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <HealthScoreDisplay score={score} />
      <TopIssues issues={topIssues} />

      <div className="flex flex-col gap-4">
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
                  <SuggestionCard key={s.id} suggestion={s} onHighlight={onHighlight} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
