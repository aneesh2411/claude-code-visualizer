@AGENTS.md

# Claude Code Workflow Visualizer

## Project Overview

A web app where developers paste or upload their Claude Code config files (CLAUDE.md, settings.json, .claude.json) and get back an interactive visual map of their entire agent setup showing MCPs, agents, skills, hooks, and commands as nodes, plus AI-powered suggestions to improve their config.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** Claude API (claude-sonnet-4-6)
- **Graph Visualization:** React Flow
- **Deployment:** Vercel

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # REST API routes
│   │   ├── parse/         # Config parsing endpoint
│   │   ├── analyze/       # AI analysis endpoint
│   │   └── sessions/      # Session CRUD
│   ├── layout.tsx
│   └── page.tsx
├── components/             # React components
│   ├── upload/            # File upload UI
│   ├── graph/             # Interactive graph visualizer
│   └── suggestions/       # AI suggestions panel
├── lib/                    # Core business logic
│   ├── parsers/           # Config file parsers
│   ├── claude/            # Claude API client
│   └── supabase/          # Supabase client
└── types/                  # TypeScript types
```

## Key Features

1. **File Upload/Paste:** Accept CLAUDE.md, settings.json, .claude.json
2. **Config Parser:** Extract MCPs, agents, skills, hooks, commands as graph nodes
3. **Interactive Graph:** React Flow visualization with node types (MCP, agent, skill, hook, command)
4. **AI Analysis:** Claude API suggestions for config improvements
5. **Session Persistence:** Save/load configs via Supabase

## Node Types (Graph)

- `mcp` — MCP server connections
- `agent` — Subagent definitions
- `skill` — Skill references
- `hook` — PreToolUse/PostToolUse/Stop hooks
- `command` — Slash commands
- `config` — Top-level config file (root node)

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Development

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run lint      # Run ESLint
npm run type-check # TypeScript check
```

## Git Workflow

- Main branch: `main`
- Feature branches: `feature/*`
- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Worktrees: `.worktrees/`

## Coding Standards

- Immutable data patterns (no in-place mutation)
- Files max 800 lines, prefer 200-400
- Functions max 50 lines
- Comprehensive error handling
- No hardcoded secrets
