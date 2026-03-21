'use client';

import { useState } from 'react';
import type { Node, Edge } from '@xyflow/react';
import type { ParsedConfig, Suggestion } from '../types';
import { transformToFlowNodes } from '../lib/graphTransform';
import UploadPanel from '../components/upload/UploadPanel';
import FileList from '../components/upload/FileList';
import WorkflowGraph from '../components/graph/WorkflowGraph';
import SuggestionsPanel from '../components/suggestions/SuggestionsPanel';

interface UploadedFile {
  name: string;
  content: string;
}

export default function HomePage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [parsedConfigs, setParsedConfigs] = useState<ParsedConfig[]>([]);
  const [flowData, setFlowData] = useState<{ nodes: Node[]; edges: Edge[] }>({
    nodes: [],
    edges: [],
  });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [parseLoading, setParseLoading] = useState(false);
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  async function handleFilesReady(files: UploadedFile[]) {
    setUploadedFiles(files);
    setError(null);
    setParseLoading(true);
    try {
      const res = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Parse failed');
      }
      const data = (await res.json()) as { data: ParsedConfig[] };
      setParsedConfigs(data.data);
      setFlowData(transformToFlowNodes(data.data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse config');
    } finally {
      setParseLoading(false);
    }
  }

  async function handleAnalyze() {
    setError(null);
    setAnalyzeLoading(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parsedConfigs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Analyze failed');
      }
      const data = (await res.json()) as { data: { suggestions: Suggestion[] } };
      setSuggestions(data.data.suggestions);
      setSidebarOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze config');
    } finally {
      setAnalyzeLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">🗺️</span>
          <h1 className="text-base font-semibold text-gray-900">Claude Code Visualizer</h1>
        </div>
        <button
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? 'Hide suggestions' : 'Show suggestions'}
        </button>
      </header>

      {error && (
        <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-6 py-2 shrink-0">
          <p className="text-sm text-red-700">{error}</p>
          <button
            className="text-red-500 hover:text-red-700 text-sm ml-4"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-[340px] border-r border-gray-200 bg-white flex flex-col gap-4 p-4 overflow-y-auto shrink-0">
          <UploadPanel onFilesReady={handleFilesReady} loading={parseLoading} />
          <FileList files={uploadedFiles} />

          {parsedConfigs.length > 0 && (
            <button
              disabled={analyzeLoading}
              onClick={handleAnalyze}
              className="w-full rounded-lg px-4 py-2.5 text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: analyzeLoading
                  ? '#4338ca'
                  : 'linear-gradient(135deg, #4f46e5, #6d28d9)',
                boxShadow: analyzeLoading ? 'none' : '0 2px 8px #4f46e540',
              }}
            >
              {analyzeLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  ✦ Analyze with AI
                </>
              )}
            </button>
          )}
        </aside>

        <main className="flex-1 overflow-hidden">
          <WorkflowGraph
            nodes={flowData.nodes}
            edges={flowData.edges}
            loading={parseLoading}
          />
        </main>

        {sidebarOpen && (
          <aside className="w-80 border-l border-gray-200 bg-white flex flex-col p-4 overflow-y-auto shrink-0">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
              AI Suggestions
            </h2>
            <SuggestionsPanel
              suggestions={suggestions}
              loading={analyzeLoading}
            />
          </aside>
        )}
      </div>
    </div>
  );
}
