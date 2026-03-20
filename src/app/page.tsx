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
      const data = (await res.json()) as { configs: ParsedConfig[] };
      setParsedConfigs(data.configs);
      setFlowData(transformToFlowNodes(data.configs));
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
        body: JSON.stringify({ configs: parsedConfigs }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? 'Analyze failed');
      }
      const data = (await res.json()) as { suggestions: Suggestion[] };
      setSuggestions(data.suggestions);
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
        <h1 className="text-lg font-semibold text-gray-900">
          Claude Code Visualizer
        </h1>
        <button
          className="text-sm text-gray-500 hover:text-gray-700"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? 'Hide Suggestions' : 'Show Suggestions'}
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
        <aside className="w-[40%] max-w-sm border-r border-gray-200 bg-white flex flex-col gap-4 p-4 overflow-y-auto shrink-0">
          <UploadPanel onFilesReady={handleFilesReady} loading={parseLoading} />
          <FileList files={uploadedFiles} />
          {parsedConfigs.length > 0 && (
            <button
              disabled={analyzeLoading}
              onClick={handleAnalyze}
              className="w-full rounded-lg border border-indigo-600 px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {analyzeLoading ? 'Analyzing...' : 'Analyze with AI'}
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
            <h2 className="text-sm font-semibold text-gray-700 mb-3">AI Suggestions</h2>
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
