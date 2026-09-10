# Forms and Interaction

Load this resource for forms, links/buttons, auth/account behavior, passive embeds, or existing owned
JavaScript.

## Links, buttons, and forms

Use semantic `a` for navigation and `button` for actions. Link mutation is limited to inspected
`attribute:href` targets and safe relative or external URLs. Do not simulate a link with raw script.
Keep labels accessible and preserve focus states. Images and icon-only controls need meaningful alt or
`aria-label` text as appropriate.

Generic forms use `functionType="form"`, an allowlisted `formType`, and canonical descendant input
bindings. A form action is runtime behavior, not arbitrary endpoint configuration. The public
allowlist includes contact, event registration, payment, login/logout/register, and shipping-address
operations, but supporting data and page state must already be available through documented tools.
Validate required fields, error/success states, keyboard behavior, and empty/submission states in the
draft preview.

## Auth/account presets

For storefront login, registration, logout, authenticated/guest branches, current-user email, order
list/detail, and order fields, use `elems_configure_auth_account` on an exact inspected behavior target
and fresh hash. For a new complete section, the same bounded contract is available through the exact
`auth_account` validation/import profile.

Supported configuration presets are `login_form`, `register_form`, `logout_form`,
`authenticated_only`, `unauthenticated_only`, `current_user_email`, `orders_source`, `orders_loop`,
`order_detail_source`, and `order_field`.

Registration accepts only the canonical website-scoped inputs exposed by the profile and preserves
the existing validation, generated account-access email, session login, and cart merge behavior. It
does not accept a password field, arbitrary endpoint, redirect, credentials, tokens, cookies, Client
identity, or session data. Account visibility uses server-rendered `loggedIn` conditions and
session-scoped providers. Purchased-resource lists use the posts function with
`access_mode="granted"`.

## Passive HTML Embed

Raw HTML is not a structural import input. To use a supported passive embed, create/identify a safe
container, inspect `html_embeds[]`, and call `elems_set_html_embed` with its bare `mdid` and fresh
hash. Safe HTTPS iframes and passive container/link/image/picture/audio/video fragments are supported;
scripts, event handlers, `srcdoc`, executable URLs, Liquid, active/declaration tags, `object`, and
`embed` are rejected. The value is non-localized and draft-only.

## Existing owned JavaScript

`elems_update_element_javascript` can replace the complete source of one explicitly inspected,
ordinary page- or template-owned script target. It cannot create an arbitrary script target through
Markup V1. Pass the exact `script_targets[].target_id` and `script_hash`. The server checks ownership,
size, syntax without executing it, closing-script injection, and high-confidence secrets; modules,
shared/prefab, invalid, and unsafe targets remain blocked.

JavaScript is owned by the `MdElement` that stores it. Do not mix unrelated components in one owner
or add website-specific platform/API behavior. Prefer functions and commands for generic runtime
capabilities. Preview and exercise meaningful interactive states after every script change.
