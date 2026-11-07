# Claude Code entry point

This repository is the public ELEMS MCP authoring contract and client documentation. It contains no
MCP server code. The connected ELEMS MCP server is authoritative: its tool schemas, descriptions,
instructions, and `elems://docs/*` resources win over these files (see
[README.md](README.md#the-server-is-authoritative)).

- Client setup and personal tokens: [README.md](README.md). Where these documents say Codex, read any
  MCP-capable agent, including Claude.
- Agent behavior with ELEMS MCP: [AGENT_GUIDE.md](AGENT_GUIDE.md), then [docs/index.md](docs/index.md)
  and only the topic documents it names. This file adds no rules of its own.
- Security reports: [SECURITY.md](SECURITY.md).
- Editing this repository: the content is public. Never add tokens, credentials, private hostnames,
  local paths, internal implementation details, or tenant data. Changes here are documentation only
  and never alter MCP server behavior. Run `npm test` after editing documentation.
