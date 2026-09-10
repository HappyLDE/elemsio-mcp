# ELEMS MCP Agent Guide

This guide is intentionally small. Tool descriptions and schemas are the operation-level contract.
When an ELEMS-specific concept is unclear, read `elems://docs/index`, then load only the focused
resource it recommends. Do not load the complete authoring corpus by default.

## Universal rules

- Start with `elems_list_websites` or `elems_find_website`. Keep the selected `website_id` as scope
  until the user changes it. Never infer authorization from an identifier.
- Prefer the smallest useful read: `elems_get_context`, then search, then one scoped subtree. Fetch a
  whole page tree only for ambiguity or genuinely page-wide work.
- Inspection is not mutation authority. `suggested_inspection_root` and the deprecated
  `suggested_edit_root` are context boundaries only. Mutate only a fresh, mutation-ready target whose
  ownership and mutability metadata allow the requested operation.
- Prefer narrow text, attribute, class, behavior, embed, insert, or delete operations. Preserve
  unrelated siblings, fields, locale values, and behavior.
- Replacing a target that has children removes every existing child subtree. Set destructive intent
  only when that removal is explicitly required by the requested outcome.
- Read immediately before compare-and-set writes and verify afterward. Keep page/template edits as
  drafts, preview meaningful changes, and perform browser QA after visual or interactive changes.
- Publication is a separate deliberate tool call. Never publish as a side effect of another edit.
- Use ELEMS Media for public hosted assets. Published pages must not refer to local filesystem paths
  or temporary chat URLs.
- Use generic ELEMS capabilities. Do not invent function types, commands, raw HTML workarounds, or
  website-specific platform behavior.

## Default edit flow

```text
resolve website -> get context -> resolve page -> search -> inspect subtree
-> choose the narrowest authorized target -> mutate -> read back -> preview/QA
-> publish only when explicitly requested
```

For structural Markup V1 work, also read `elems://docs/markup-v1`, validate the exact payload, and
pass the validated string unchanged to the mutation tool.

## Stop condition

If the requested result cannot be expressed by the exposed ELEMS MCP tools and documented
capabilities, stop and report the missing platform capability. Do not bypass ownership, use an
authenticated editor as a fallback, fabricate an MCP operation, or modify private platform code.
