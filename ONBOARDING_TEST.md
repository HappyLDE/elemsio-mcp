# External Onboarding Acceptance Test

This scenario represents a normal external user with a fresh Codex installation, no ELEMS source
repository, no administrator rights, this public documentation, and a user-owned ELEMS MCP token.

## Configuration path

1. Create or sign in to a normal ELEMS account.
2. Open **Account → Developer & API → MCP / API tokens**.
3. Create a descriptively named personal token and copy it from the one-time display.
4. Confirm the account page subsequently lists only token metadata and can revoke the token with
   confirmation. Browser developer tools, session-token extraction, administrator access, source
   repositories, and database access must not be required.
5. Store the personal token in `ELEMS_MCP_TOKEN` without writing it to a repository.
6. Add the Streamable HTTP server from the README to Codex `config.toml`.
7. Restart Codex and confirm the ELEMS server appears in `/mcp` or `codex mcp list`.
8. Ask the agent to list the account's websites.
9. Select one returned website, or explicitly create a new website.
10. Confirm the new website is immediately returned by exact-ID lookup and context inspection.
11. List pages, inspect one page, and perform a non-publishing draft operation where appropriate.
12. Read back the draft and open its supported preview.
13. Publish only in an authorized test website and only when explicitly requested.

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
