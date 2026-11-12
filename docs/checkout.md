# ELEMS Modern V2 Native Ecommerce Checkout

This document describes how a Modern V2 storefront checkout works in Runtime and what MCP can and
cannot currently author for it. It separates confirmed platform behavior from page details that an
agent must verify on the target website before reusing or reproducing a checkout.

## Confirmed behavior

### It is a normal Modern V2 page

A storefront checkout is typically an ordinary published `page` at a slug such as `/checkout`, with
`system_page_type` unset and a normal effective template. Its route is not a reserved checkout route:
Runtime handles unmatched GET and POST paths with the generic page handler, resolves the
website/domain and locale, then resolves the path slug against the website's pages and its
translation for the selected locale.

For a Modern V2 page, Runtime loads the effective template and the published page/template element
functions, builds their runtime data contexts, and renders the published page and template content.
Both page-owned and template-owned functions are supported. Which owner contains a particular
website's checkout form must be confirmed by inspecting that website.

### Checkout uses existing ecommerce functions

Runtime recognizes these generic function types for checkout:

- `cart` reads and hydrates the website's current cart and payment configuration;
- `shippingCountries` supplies the country options used by checkout shipping UI;
- `paymentMethods` and `checkoutPaymentMethods` supply the configured checkout payment methods.

A common composition places a template-owned `cart` function on a shared cart section, with a
“Checkout” button that is a regular anchor to `{{ base_url }}/checkout` rather than a checkout
function. There is no dedicated `checkout` function type or checkout preset in the Runtime or MCP
function allowlists (see `elems://docs/functions`).

### Runtime supplies shared checkout JavaScript and server actions

Runtime appends shared storefront checkout JavaScript. The script activates when rendered content
contains one of the recognized hooks below; it then manages checkout UI state and sends actions to
Runtime. This is generic storefront support; a checkout page does not need its own script for it.

Recognized activation markers include:

- `checkout-stripe-payment-element`
- `create_stripe_payment_intent`
- `shipping-zone-rate-options`
- `checkout-discount-code`

The script also looks for checkout regions such as `.checkout-payment-section`,
`.checkout-stripe-start-btn`, `.checkout-dynamic-shipping-section`, `.checkout-paypal-wrapper`,
`#checkout-paypal-buttons`, and `.checkout-dev-payment-wrapper`. Guest/client checkout roots and
customer, shipping, billing, payment, and shipping-rate controls are queried by the shared code.
These are Runtime integration hooks; this list is not a complete required page schema, and not every
hook is required on every checkout.

POST requests are routed through the same generic page handler. Runtime uses the submitted element
identifier (`eid`) to find the owning function and dispatches `cart_action` for a `cart` provider.
Existing handlers include `set_guest_checkout_details`, `get_checkout_cart`,
`set_shipping_zone_rate`, and payment actions such as `create_stripe_payment_intent` and
`create_paypal_order`/`capture_paypal_order`. Server-side cart, shipping, and payment checks remain
authoritative.

### Cart and locale context are preserved by Runtime

For a guest, checkout reads the cart identifier from the existing Runtime session and selects a
guest cart belonging to that website. For a signed-in client, it first checks the session cart for
that client, then falls back to a cart scoped to the current website. The checkout route does not
itself create a replacement cart. The same website session continues across locale-prefixed routes.

Runtime derives `base_url` from the selected locale and website/domain defaults. A template link to
`{{ base_url }}/checkout` therefore keeps the checkout path in the current locale context.

## Verify before reuse

- `elems_get_page` can confirm that a checkout page exists and is published while
  `elems_get_page_elements` still returns `PAGE_NOT_FOUND`. In that case the template may be
  inspectable, but the page's exact V2 element tree is not.
- `PAGE_NOT_FOUND` is MCP's normalized error for page-content errors. It does not mean the published
  Page record or rendered `/checkout` route is absent.
- Until a readback succeeds, the checkout's element ownership, markup tree, form shape, and any
  page-specific JavaScript are unverified. Do not infer them from another website.
- Do not create a new checkout `functionType` or a checkout preset; none exists.

## Known MCP limitations

MCP can create a non-root Modern V2 draft page using an existing website-owned template, initialize
active locales, insert/import supported static structure, and update allowlisted element behaviors
and commands with compare-and-set values. Page insertion/import is normally static-only; behavior is
configured through inspected canonical targets. The published checkout is never created by the page
creation operation alone.

When a checkout page's V2 content cannot be read through MCP, MCP cannot provide a verified tree to
reuse, and its error normalization does not distinguish an absent Page from unavailable content.

MCP supports native Page-ID destinations for menu items (see `elems://docs/menus`). An ordinary
page/template anchor `attribute:href` target accepts `destination_page_id` in `elems_update_element`
text mode: the server stores the canonical `{{ base_url }}/<slug>` href of that same-website Page,
which Runtime resolves in the visitor's locale (see `elems://docs/elements`).
Do not substitute hardcoded locale URLs or claim that a checkout link is connected across locales
before readback shows the stored destination. A checkout link inside a cart drawer whose script
selects anchors generically (for example `a[href]`) remains protected until that script's anchor
selectors are narrowed.

See also `elems://docs/pages`, `elems://docs/functions`, and `elems://docs/commands`.

## Authoring guidance

1. Inspect the target website's checkout page and effective template through MCP. If the page's V2
   content is unreadable, stop and report that limitation rather than guessing its structure.
2. When readable, verify the exact checkout tree, behavior ownership, form/action bindings, and
   whether the page has its own scripts. Document and rely only on what readback confirms.
3. Only then assess whether existing static structure and native function operations can reproduce
   that verified composition on another website. Preview empty and populated carts, shipping and
   payment states, and each active locale before treating a reproduction as safe.

Until those checks pass, do not claim that a checkout can be reproduced safely on another website.
A native cart can be confirmed independently, but the checkout page structure and a locale-aware
link from a cart drawer to the checkout page require separate verification.
