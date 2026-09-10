# ELEMS MCP Agent Guide

The MCP server's tool descriptions, schemas, instructions, and `elems://docs/agent-guide` resource are
authoritative. Read them after connecting.

## Scope and selection

- Start with `elems_list_websites` or `elems_find_website` and select the intended website before any
  scoped operation.
- If the user explicitly asks for a new website, use `elems_create_website`; never try to select an
  owner, entity, privilege, subscription, or unrelated custom domain.
- Keep the selected `website_id` as the working scope until the user changes it.
- Never infer access from an identifier. Respect server-side ownership and mutability results.
- If discovery is ambiguous, present the candidates and do not guess.

## Inspect narrowly, then mutate narrowly

For a localized page edit, prefer:

```text
search → subtree → mutate → read back
```

- Search for distinctive visible text with `elems_search_page_elements`.
- Inspect only the matched target or `suggested_inspection_root` with
  `elems_get_element_subtree`.
- `suggested_inspection_root` is context for inspection, not mutation authority. The deprecated
  `suggested_edit_root` has the same inspection-only meaning.
- Choose the narrowest page-owned mutation target containing only the requested content.
- Prefer text, attribute, class, embed, insert, or delete operations over broad structural
  replacement.
- Use full-page element inspection only when search is ambiguous, scoped context is insufficient, or
  the task genuinely spans the full page.

Destructive structural replacement requires explicit user intent. If the server reports that
replacement would remove existing child subtrees, do not set the destructive-intent flag unless the
user's requested outcome clearly requires removing all of them.

## Drafts, previews, and publication

- Treat page and template changes as drafts unless the tool explicitly says otherwise.
- Read current state immediately before a compare-and-set write and verify it afterward.
- Use the supported draft preview tool and browser rendering for visual QA when needed.
- Publication is a separate deliberate operation. Never publish implicitly after another mutation.
- Read the latest publication state and revision before publishing.

## Media and platform behavior

- Use ELEMS Media discovery or the supported prepare-upload/direct-upload/finalize flow for public
  website media.
- Do not use local filesystem paths, temporary chat URLs, unrelated external URLs, or protected
  assets as public website media.
- Avoid website-specific platform hacks. If a reusable capability is missing, report the missing MCP
  capability.
- Do not fall back to an authenticated editor/admin UI unless the user explicitly requests UI use.

## Structural work

- Read `elems://docs/markup-v1` before structural imports.
- Validate markup with the read-only validator, then pass the validated markup unchanged to the
  import tool.
- Use only mutation-ready identifiers and hashes returned by the latest inspection.
- Preserve unrelated siblings and locale content.
