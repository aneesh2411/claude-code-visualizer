export type NodeType = 'config' | 'mcp' | 'agent' | 'skill' | 'hook' | 'command';

export interface ConfigNode {
  id: string;
  type: NodeType;
  label: string;
  data: Record<string, unknown>;
}

export interface ConfigEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface ParsedConfig {
  nodes: ConfigNode[];
  edges: ConfigEdge[];
  sourceFile: string;
  rawContent: string;
}

export interface Suggestion {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'performance' | 'structure' | 'missing' | 'redundant';
  title: string;
  description: string;
  fix?: string;
  affectedNodeIds?: string[];
}

export interface Session {
  id: string;
  name: string;
  config_files: Record<string, string>;
  parsed_config: ParsedConfig | null;
  suggestions: Suggestion[] | null;
  created_at: string;
  updated_at: string;
}
