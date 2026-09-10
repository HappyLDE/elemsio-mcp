# External Onboarding Acceptance Test

This scenario represents a normal external user with a fresh Codex installation, no ELEMS source
repository, no administrator rights, this public documentation, and a user-owned ELEMS MCP token.

## Configuration path

1. Store the token in `ELEMS_MCP_TOKEN` without writing it to a repository.
2. Add the Streamable HTTP server from the README to Codex `config.toml`.
3. Restart Codex and confirm the ELEMS server appears in `/mcp` or `codex mcp list`.
4. Ask the agent to list the account's websites.
5. Select one returned website, or explicitly create a new website.
6. Confirm the new website is immediately returned by exact-ID lookup and context inspection.
7. List pages, inspect one page, and perform a non-publishing draft operation where appropriate.
8. Read back the draft and open its supported preview.
9. Publish only in an authorized test website and only when explicitly requested.

## Required isolation assertions

Automated ELEMS server tests use two independent normal-user fixtures:

- User A owns Website A.
- User B owns Website B.

The acceptance gate requires A to discover and operate on A, B to discover and operate on B, and A
to receive the same nondisclosing failure for Website B as for a nonexistent identifier. Guessed page,
template, media, product, content, and publication identifiers must remain behind the same
website/entity authorization boundary. Creation by A must create owner access for A and no access for
B. Existing platform-administrator compatibility is tested separately.

Do not run this acceptance test against real customer websites. Use automated fixtures and an
explicitly designated test website for any live smoke test.
