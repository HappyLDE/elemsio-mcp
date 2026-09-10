# Localization

Load this resource for website locales, locale-specific page content, selectors, routes, and fallback
behavior.

## Locale scope

`elems_get_context` reports the website's active locales and `required_markup_locales`.
`elems_add_website_locale` adds or reactivates one ELEMS-supported locale without replacing existing
locales or changing the default. It does not translate page content. Read context again after adding a
locale.

Each localized text value lives in the element's content map. Localized `alt`, `placeholder`, `title`,
and `aria-label` use the canonical locale-specific attribute representation. A text/attribute update
changes only the requested locale and preserves every other locale.

On inspection, `current_value: null` means the requested locale key is missing; `""` means it exists
and is explicitly empty. Pass that exact state as the compare-and-set precondition. Do not copy a
display fallback into `expected_value`.

`locale_resolution` reports whether the requested page locale is native, missing, or publicly served
through fallback. Each target's `locale_value_status` is exact for the requested locale. Fallback
content can explain what a visitor currently sees, but it is never returned as editable content for a
missing locale.

## Structural and publication behavior

Markup V1 requires non-empty text for every active locale on every text-bearing element and complete
values for each localized attribute used. Read `required_markup_locales`; ELEMS does not invent
translations. Inactive locale keys are rejected.

Draft generation and publication state are locale-aware. Preview can show a draft translation, while
public rendering includes only published locale translations. Publish a page with an explicit locale
and fresh state. Decide whether a requested change applies to one locale or all locales; never assume.

## Canonical locale selector

Inspect `locale_selector_targets[]` and use `elems_configure_locale_selector` with its exact
`target_id`, fresh `selector_hash`, and `preset="website_locales"`. The runtime supplies ordered
active locales, current state, names, icon data, and equivalent-page links. Future active locales then
require no hardcoded selector edit.

Do not hardcode locale arrays, names, or URLs, and do not write raw selector JavaScript or behavior.
A legacy selector is migratable only when all removable behavior is wholly owned by that selector
subtree. Ancestor-scoped, mixed, shared, or unknown behavior must be reported rather than parsed or
rewritten.

The underlying public function/command model uses `functionType="locales"`, a `localeItems` loop, and
bindings such as `localeCode`, `localeName`, `localeUrl`, `localeLang`, `localeHrefLang`,
`localeIconUrl`, and `localeIsCurrent`. Prefer the dedicated selector tool, which preserves styling
and validates the whole subtree.
