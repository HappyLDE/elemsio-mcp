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
| `cart` | Cart summary/items/shipping context | none |
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
