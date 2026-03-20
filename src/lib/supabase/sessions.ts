// SQL Schema:
// CREATE TABLE sessions (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   name TEXT NOT NULL,
//   config_files JSONB NOT NULL,
//   parsed_config JSONB,
//   suggestions JSONB,
//   created_at TIMESTAMPTZ DEFAULT now(),
//   updated_at TIMESTAMPTZ DEFAULT now()
// );

import type { Session } from '../../types';
import { supabaseServerClient } from './server';

const TABLE = 'sessions';

export type SessionUpdates = Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>>;

function assertSession(row: unknown): Session {
  return row as Session;
}

export async function createSession(
  name: string,
  configFiles: Record<string, string>,
): Promise<Session> {
  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .insert({ name, config_files: configFiles })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return assertSession(data);
}

export async function getSession(id: string): Promise<Session | null> {
  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .select()
    .eq('id', id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? assertSession(data) : null;
}

export async function updateSession(
  id: string,
  updates: SessionUpdates,
): Promise<Session> {
  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return assertSession(data);
}

export async function listSessions(): Promise<Session[]> {
  const { data, error } = await supabaseServerClient
    .from(TABLE)
    .select()
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(assertSession);
}

export async function deleteSession(id: string): Promise<void> {
  const { error } = await supabaseServerClient
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}
