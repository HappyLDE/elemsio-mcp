# Runtime Functions

Load this resource only when an element needs or already has runtime-provided data. Static content and
layout do not need a function.

## Model and mutation boundary

`functionType` selects one generic ELEMS runtime provider. `functionData` is its flat string-to-string
configuration map. Commands on the function owner or descendants bind the provider's values into
content, attributes, loops, or conditions. The function owner's `mdid` is the runtime scope; nested
commands resolve the nearest matching provider context.

Use `behavior_targets[].target_id` and `behavior_hash` with the behavior mode of
`elems_update_element` only on a mutable page/template-owned target. Updates replace the supplied
behavior fields under whole-element compare-and-set. Prefer a dedicated configuration tool when one
exists because it validates ownership and hides raw runtime configuration:

- auth/account: `elems_configure_auth_account`;
- locale selector: `elems_configure_locale_selector`;
- generic posts: `elems_configure_posts_function`;
- editorial direct product: `elems_update_element_product_context`;
- product price binding: `elems_update_element_dynamic_binding`.

Normal page insert/import is static-only. The exact `auth_account` import profile is the bounded
exception. Template insertion may carry validated `fn`, flat `fnData.*`, and `cmd.*` metadata after
`elems_validate_template_element`.

## Public allowlisted function types

<!-- public-function-types:start -->
| `functionType` | Purpose and placement | Allowed `functionData` keys |
| --- | --- | --- |
| `shippingCountries` | Provider on a checkout/address container for a country-options loop | none |
| `locales` | Provider on a canonical locale-selector container | none |
| `productsCollection` | Product collection/listing container | `source`, `limit`, `perPage`, `pageParam`, `sort`, `excludeCurrentProduct`, `collectionId`, `collectionSlug` |
| `productSearch` | Search-results container | `queryParam`, `pageParam`, `perPage`, `limit` |
| `shippingAddress` | Current authenticated/cart shipping-address context | none |
| `shippingAddresses` | Authenticated address-list container | none |
| `clientOrders` | Authenticated order-list source | `perPage`, `limit`, `pageParam` |
| `clientOrderDetail` | Authenticated order-detail source | `identifierParam` |
| `urlParams` | Route-query condition provider on the containing runtime region | none |
| `product` | One direct product card/detail context | `productId` |
| `cart` | Cart summary/items/shipping context; optional empty resource checkout presentation | `presentation`, `productId` |
| `paymentMethods` | Available payment-method list context | none |
| `checkoutPaymentMethods` | Checkout payment-method context; aliases the payment-method command scope | none |
| `posts` | Generic structured-content list/detail source | `postsIdentifierId`, `mode`, `parentId`, `postId`, `postSlug`, `use_suffix_slug`, `access_mode` |
| `eventMirror` | Existing event-component bridge to another element function | `mdElementId` |
| `menu` | Existing website-menu provider | `menuId` |
| `form` | Canonical generic form action | `formType`, `contactEmailCustom`, `contactEmail`, `paymentTitle`, `paymentType`, `postsIdentifierId`, `validate_address` |
<!-- public-function-types:end -->

These are the behavior validator's current external allowlist, not a promise that an agent can create
every supporting catalog/menu/event object. Do not invent IDs. Resolve selectable objects with MCP
tools when available or preserve an already inspected configuration; otherwise report the missing
capability.

Important value constraints include:

- boolean strings: `excludeCurrentProduct`, `use_suffix_slug`, `contactEmailCustom`, and
  `validate_address` are exactly `"true"` or `"false"`;
- positive decimal IDs: `collectionId`, `productId`, `postsIdentifierId`, and `menuId`;
- `mode`: `list` or `detail`; `access_mode`: `all` or `granted`;
- `source`: `newest`, `sameCollection`, or `collection`; `sort`: `manual`, `random`, or `newest`;
- query parameter names start with a letter and contain only letters, digits, or underscore;
- `parentId`, `postId`, and `mdElementId` use the inspected canonical identifier form.

Supported `formType` values are `event_registration`, `payment`, `login`, `logout`, `register`,
`contact`, `create_shipping_address`, `edit_shipping_address`, and `delete_shipping_address`. Auth
forms should use the bounded preset tool/profile, not hand-authored credentials, endpoints, sessions,
password values, or redirects.

## Compact example

On an existing mutable template container, a validated generic posts source might be represented in
Markup V1 as:

```text
0 div "Articles" fn="posts" fnData.postsIdentifierId="123" fnData.mode="list" fnData.access_mode="all"
```

The numeric ID is illustrative; use an ID returned by the same website's content tools. Descendant
loop and value bindings are documented in `elems://docs/commands`.

Generic capabilities belong in generic primitives. A site-specific requirement is not a reason to
invent a new core function type. If the allowlist and tools cannot express it, stop and report the
platform limitation.

An empty `cart` provider with `presentation="resource_checkout"` and a same-website positive
`productId` renders the generic resource-product purchase surface. Custom children/content/embeds
retain custom rendering. This presentation requires an authenticated buyer; TEST products require
a canonical technical QA buyer. Prices come from the catalog, quantities are one, and a pending
order grants no access. The TEST payment action is disabled without a sandbox provider.

## Native Events through the canonical Events domain

MCP 1.59.0 adds four dedicated tools. `event` and `eventItem` remain forbidden in generic behavior
updates, imports and template insertion; use the typed Event workflow:

1. `elems_list_events` discovers the same native Events as the Events dashboard, with bounded
   pagination, session identities, integrity diagnostics and page publication information.
2. `elems_get_event_configuration` inspects an owned Modern page and optional Event. Before creation,
   omit `event_id` to discover eligible existing containers, descendant cards and existing native
   registration forms. Read `configuration.root_id` and the opaque whole-source `revision` unchanged.
   With `event_id`, read current sessions, marked metadata, canonical Mongo configuration, generated
   SQL configuration, and per-locale draft/published state. Generated configuration can be refreshed
   before publication and is not a published snapshot. No participant records are exposed.
3. `elems_validate_event_configuration` validates a complete proposed configuration through the same
   domain planner and historical identity checks as saving, without writes or generation. Validation
   reserves nothing; a subsequent save repeats all checks against the revision.
4. `elems_configure_event` creates or updates exactly one Event. Use `operation=create` with the exact
   existing `container_id`, or `operation=update` with the exact existing `event_id`. Include the page,
   root, revision, name, `registration_form_id` (existing descendant form ID or empty string), and the
   complete `sessions` list. Each of at most 200 sessions requires an existing eligible descendant
   `element_id`, a plain title, full ISO start/end timestamps with seconds and explicit offset, and an
   IANA timezone. Offsets must match the zone; no missing dates/times may be invented. Include every
   existing session unchanged unless deliberately configuring it. No session removal, movement,
   reassignment, capacity changes, arbitrary functionData, or new visible structure is accepted.

All four operations require website owner/admin authorization. The API rechecks website/entity/page,
Modern template/root ownership, globally aliased roots, target eligibility, source deletion, duplicate
and nested identities, historical registration references, and full-source concurrency. Mongo is the
only authoring source; the existing compiler regenerates `element_functions` and all active-locale
drafts. Existing IDs, children, classes, styling and unrelated locale content are preserved. Missing
metadata is hidden. Existing marked title/date edits are deliberate: inspect `updates_visible_content`
before editing them. Registration form association preserves existing inputs and submission behavior;
it does not create, repair or activate a public form. Keep visual registration prototypes unchanged.

Configuration never publishes. A successful source write reports `source_saved=true`, `draft_only=true`
and `draft_status=generated` or `regeneration_required`. If generation fails, read the saved Event and
use existing draft regeneration; do not replay creation with stale input. Read back canonical and
generated configuration, use the ordinary page preview, and publish each explicitly authorized locale
separately through `elems_publish_page` with freshly inspected publication state.

Capacity is read-only. Current Runtime does not enforce seat limits. These tools do not activate public
registration, create registrations, modify historical records, or deploy Stage 3A protected admission.
