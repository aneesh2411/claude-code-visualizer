import type { ParsedConfig, Suggestion } from '@/types';

export interface AnalysisRequest {
  parsedConfigs: ParsedConfig[];
}

export interface AnalysisResponse {
  suggestions: Suggestion[];
  analysisId: string;
  model: string;
}
