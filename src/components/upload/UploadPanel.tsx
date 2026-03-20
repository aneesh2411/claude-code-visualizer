'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';

interface UploadedFile {
  name: string;
  content: string;
}

interface UploadPanelProps {
  onFilesReady: (files: UploadedFile[]) => void;
  loading?: boolean;
}

type Tab = 'upload' | 'paste';

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export default function UploadPanel({ onFilesReady, loading }: UploadPanelProps) {
  const [tab, setTab] = useState<Tab>('upload');
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [pasteContent, setPasteContent] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const loaded = await Promise.all(
      selected.map(async (f) => ({ name: f.name, content: await readFileAsText(f) }))
    );
    setFiles((prev) => [...prev, ...loaded]);
  }

  async function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    const loaded = await Promise.all(
      dropped.map(async (f) => ({ name: f.name, content: await readFileAsText(f) }))
    );
    setFiles((prev) => [...prev, ...loaded]);
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(true);
  }

  function handleDragLeave() {
    setDragOver(false);
  }

  function handleParse() {
    if (tab === 'paste' && pasteContent.trim()) {
      onFilesReady([{ name: 'CLAUDE.md', content: pasteContent }]);
    } else {
      onFilesReady(files);
    }
  }

  const canParse =
    (tab === 'upload' && files.length > 0) ||
    (tab === 'paste' && pasteContent.trim().length > 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex border-b border-gray-200">
        {(['upload', 'paste'] as Tab[]).map((t) => (
          <button
            key={t}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t === 'upload' ? 'Upload Files' : 'Paste CLAUDE.md'}
          </button>
        ))}
      </div>

      {tab === 'upload' ? (
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".md,.json"
            className="hidden"
            onChange={handleFileChange}
          />
          <p className="text-sm text-gray-500">
            Drag & drop or{' '}
            <span className="text-indigo-600 font-medium">click to upload</span>
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Accepts CLAUDE.md, settings.json, .claude.json
          </p>
          {files.length > 0 && (
            <p className="text-xs text-indigo-600 mt-2">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>
      ) : (
        <textarea
          className="w-full h-40 rounded-lg border border-gray-300 p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          placeholder="Paste your CLAUDE.md content here..."
          value={pasteContent}
          onChange={(e) => setPasteContent(e.target.value)}
        />
      )}

      <button
        disabled={!canParse || loading}
        onClick={handleParse}
        className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Parsing...' : 'Parse Config'}
      </button>
    </div>
  );
}
