# Security

## Authorization guarantee

An authenticated non-administrator may discover, inspect, create, or mutate only resources granted
to that ELEMS user by the normal ELEMS authorization model. Supplying or guessing a website, entity,
page, template, media, product, or content identifier does not grant access.

Named MCP tokens inherit the creating user's permissions. They do not bypass authorization or grant
platform-administrator rights. A user can list and revoke only their own named MCP tokens.

## Credential handling

- Create and revoke personal MCP tokens only from the signed-in ELEMS account interface. Never
  extract or reuse the browser's ELEMS sign-in credential for client setup.
- Store MCP tokens in a password manager and inject them through `ELEMS_MCP_TOKEN`.
- Never commit tokens or paste them into issue reports, logs, screenshots, or chat messages.
- Revoke a token immediately if it may have been exposed.
- Prefer a dedicated ELEMS user when operational separation is needed.

## Reporting a security issue

Do not open a public issue containing credentials, personal data, or exploit details. Contact ELEMS
through its normal private support channel and include only the minimum information needed to
reproduce the issue.
