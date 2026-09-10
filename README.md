# ELEMS MCP

ELEMS MCP connects Codex and other MCP-capable agents to the normal ELEMS website-management
capabilities of the authenticated ELEMS account.

Production endpoint:

```text
https://api.elems.io/mcp
```

It can create an ELEMS website, discover and manage websites your account can access, create and edit
pages, work with page elements and ELEMS Media, manage supported templates and structured content,
preview drafts, and publish through explicit supported tools.

Named token management, website inventory, and normal-user website creation require ELEMS MCP 1.36.0
or later. After connecting, check the server version and exposed tool list before beginning.

## Security model

An ELEMS MCP token operates as the ELEMS user who created it. It does not grant administrator rights
and does not grant access to websites or resources outside that user's normal ELEMS authorization.
Server-side checks are applied even when a caller supplies a website, entity, page, template, media,
product, or content identifier directly.

Treat the token like a password. Do not paste it into source code, `config.toml`, chat messages, issue
reports, logs, or commits.

## Create a personal MCP token

Named MCP tokens are user-owned, revocable opaque access tokens. ELEMS stores only a hash. The
plaintext value is shown once when the token is created. Tokens currently expire after the lifetime
configured by ELEMS (one year by default).

Use the normal ELEMS account interface:

1. Create or sign in to your ELEMS account at [app.elems.io](https://app.elems.io).
2. Open **Account**.
3. Find **Developer & API → MCP / API tokens**.
4. Enter a descriptive name such as `Omarchy Codex` and choose **Create token**.
5. Copy the token from the one-time display and store it securely.

The token cannot be displayed again after you close the one-time view. The same account page lists
token names, creation dates, and expiry dates without exposing plaintext, and lets you revoke a token
at any time.

You never need to open browser developer tools, extract an ELEMS sign-in credential, inspect network
requests, use an administrator account, or access an ELEMS repository or database.

## Configure Codex

Codex supports Streamable HTTP MCP servers with bearer tokens sourced from environment variables.
The desktop app, CLI, and IDE extension share the MCP configuration for the same Codex host. See the
[official Codex MCP documentation](https://learn.chatgpt.com/docs/extend/mcp?surface=cli).

Add this to `~/.codex/config.toml` (or a trusted project's `.codex/config.toml`):

```toml
[mcp_servers.ELEMS]
url = "https://api.elems.io/mcp"
bearer_token_env_var = "ELEMS_MCP_TOKEN"
default_tools_approval_mode = "writes"
tool_timeout_sec = 30
enabled = true
```

Set the token in the environment that starts Codex.

Linux/macOS (`bash` or `zsh`):

```sh
read -rsp "ELEMS MCP token: " ELEMS_MCP_TOKEN; echo
export ELEMS_MCP_TOKEN
```

Windows PowerShell:

```powershell
$secureToken = Read-Host "ELEMS MCP token" -AsSecureString
$tokenPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureToken)
try { $env:ELEMS_MCP_TOKEN = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($tokenPointer) }
finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($tokenPointer) }
```

These values last for the current shell/process. Restart Codex after changing its environment or MCP
configuration. Use `/mcp` in Codex or `codex mcp list` in a terminal to inspect the connection.

Do not use commands that permanently write the token to shell profiles, repository `.env` files, or
PowerShell history.

## First website workflow

Ask Codex to:

```text
Use ELEMS MCP. List my websites. If I have no suitable site, create one named "My New Site",
select it, read its context, and show me its pages. Do not publish anything yet.
```

The expected flow is:

```text
elems_list_websites or elems_find_website
→ elems_create_website when explicitly requested
→ elems_get_context
→ elems_list_pages / elems_create_page
→ inspect and edit narrowly
→ preview
→ publish only when explicitly requested
```

For detailed agent behavior, read [AGENT_GUIDE.md](AGENT_GUIDE.md).

## The server is authoritative

After connecting, agents should inspect the MCP tool schemas, descriptions, server instructions, and
the `elems://docs/agent-guide` resource. Those are the current machine-readable contract. This public
repository intentionally does not duplicate ELEMS implementation details or the complete tool
reference.

## Troubleshooting

- `401 Unauthorized`: the token is missing, malformed, expired, or revoked.
- Website not found: the authenticated user does not have access, the identifier is wrong, or the
  result is intentionally hidden to prevent cross-user discovery.
- Creation blocked: normal ELEMS account, cooldown, locale, blueprint, or domain rules prevented it.
- A write conflict: inspect the resource again and retry with fresh compare-and-set metadata.
