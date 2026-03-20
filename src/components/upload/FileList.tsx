'use client';

interface UploadedFile {
  name: string;
  content: string;
}

interface FileListProps {
  files: UploadedFile[];
}

function getFileBadge(name: string): { label: string; color: string } {
  if (name === 'CLAUDE.md' || name.endsWith('.md')) {
    return { label: 'CLAUDE.md', color: 'bg-blue-100 text-blue-700' };
  }
  if (name === 'settings.json') {
    return { label: 'settings.json', color: 'bg-green-100 text-green-700' };
  }
  if (name === '.claude.json' || name.endsWith('.claude.json')) {
    return { label: '.claude.json', color: 'bg-purple-100 text-purple-700' };
  }
  return { label: name, color: 'bg-gray-100 text-gray-600' };
}

export default function FileList({ files }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <ul className="flex flex-col gap-1 mt-2">
      {files.map((file, i) => {
        const badge = getFileBadge(file.name);
        return (
          <li
            key={`${file.name}-${i}`}
            className="flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 bg-white"
          >
            <span className={`text-xs font-medium rounded px-2 py-0.5 ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-xs text-gray-400 truncate">{file.name}</span>
          </li>
        );
      })}
    </ul>
  );
}
