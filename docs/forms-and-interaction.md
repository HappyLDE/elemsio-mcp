# Forms and Interaction

Load this resource for forms, links/buttons, auth/account behavior, passive embeds, or existing owned
JavaScript.

## Links, buttons, and forms

Use semantic `a` for navigation and `button` for actions. Link mutation is limited to inspected
`attribute:href` targets and safe relative or external URLs. Do not simulate a link with raw script.
Keep labels accessible and preserve focus states. Images and icon-only controls need meaningful alt or
`aria-label` text as appropriate.

Generic forms use `functionType="form"`, an allowlisted `formType`, and canonical descendant input
bindings. A provider alone does not create a working form: contact submissions require a semantic
`<form>` root with `method="POST"` and a real submit control. A form action is runtime behavior, not
arbitrary endpoint configuration.

For a native contact form on a normal Page, read `elems://docs/markup-v1`, then call
`elems_validate_markup` and `elems_import_markup` with `behavior_profile="contact_form"`, passing the
same validated Markup V1 string and profile to both. The bounded profile accepts one semantic form
with `fn="form"`, `fnData.formType="contact"`, an optional custom recipient expressed by
`fnData.contactEmailCustom="true"` and a valid `fnData.contactEmail`, and any number of well-formed
fields. Each bound control uses `name="input_<field>"` and
`cmd.formInput="name:<field>|prop:value"`. Include a hidden
`input_elemss="square"` challenge control required by the existing Runtime contact path, an explicit
`button type="submit"` or `input type="submit"`, and `if:formSuccess` and `if:formError` state
elements. Native HTML `required` on `input`, `select`, or `textarea` represents required state; omit
it for optional fields. For example, name/email/message can be required while company/phone remain
optional. Provider configuration alone is not sufficient: the Runtime submission branch needs the
semantic form and challenge control before it can send the message.

The profile rejects nested forms, `action`, methods other than POST, external endpoints, unsupported
behavior, and raw HTML. Use `contact_form` on both validation and import; the default profile remains
static-only. Inspection returns `behavior_targets[].contact_form` with the semantic tag, POST method,
provider type, recipient, each field's native control type, binding and required flag, challenge,
explicit submit type, and success/error bindings. Element attributes and behavior commands remain
available in the same inspection for exact readback.

Other generic forms use their existing documented runtime contracts. Validate required fields,
error/success states, keyboard behavior, and empty/submission states in the draft preview.

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
