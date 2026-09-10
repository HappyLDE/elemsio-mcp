# ELEMS Authoring Documentation Index

Use tool schemas directly for simple operations. If ELEMS-specific knowledge is needed, load only the
resources below; do not read all of them by default or reload documents already understood in the
same task.

| Resource | Load when | Do not load merely for |
| --- | --- | --- |
| [elements](elements.md) · `elems://docs/elements` | Understanding trees, `mdid`, `domType`, content, attributes, targets, or safe mutation | A tool schema already fully describes a one-field edit |
| [styling](styling-tailwind.md) · `elems://docs/styling` | Editing classes, responsive layout, visual composition, or Tailwind/JIT behavior | Text-only edits |
| [pages](pages-and-drafts.md) · `elems://docs/pages` | Creating/editing pages, drafts, previews, publication, or structural safety | Template-only conceptual questions |
| [templates](templates-and-ownership.md) · `elems://docs/templates` | Shared headers/footers, effective templates, template ownership, or template publication | Page-owned section edits |
| [functions](functions.md) · `elems://docs/functions` | Attaching or interpreting `functionType` and `functionData` | Static content/layout work |
| [commands](commands-runtime.md) · `elems://docs/commands` | Loops, conditions, runtime values, or command parameters | Static pages with no runtime bindings |
| [media](media.md) · `elems://docs/media` | Discovering/uploading website assets or using media references | No asset work |
| [localization](localization.md) · `elems://docs/localization` | Adding locales, editing locale-specific values, selectors, routes, or fallback | A known single-locale, nonlocalized change |
| [forms](forms-and-interaction.md) · `elems://docs/forms` | Forms, auth/account behavior, links/buttons, embeds, or owned JavaScript | Pure styling |
| [content](content-primitives.md) · `elems://docs/content` | Generic collections and `MdPost` records, listings, detail pages, or protected resources | Ordinary page copy |
| [ecommerce](ecommerce.md) · `elems://docs/ecommerce` | Products, variants, pricing, carts, checkout, orders, promos, or product bindings | Brochure websites |
| [website creation](website-creation.md) · `elems://docs/website-creation` | Listing/selecting sites or creating a new account-owned website | Work on an already selected website |
| `elems://docs/markup-v1` | Inserting/importing/replacing structure with canonical Markup V1 | Narrow text/class/behavior writes |

Common routes:

- One icon, text, or class: tool schema; optionally `elements` and `styling`.
- One page-section redesign: `elements`, `styling`, `pages`; add `media` only if assets change.
- Shared header/footer: `elements`, `styling`, `templates`.
- Dynamic locale selector: `elements`, `functions`, `commands`, `localization`, and `templates` when shared.
- New website: `website-creation`, `pages`, `elements`, `styling`; add capability topics only as needed.

Expand documentation scope only when the task expands or a current uncertainty requires it. If the
required capability is absent from tools and these resources, stop and report the limitation.
