# ELEMS Modern V2 Native Ecommerce Checkout

This document records the source-backed investigation of the public storefront checkout used by
Ringador. It distinguishes observed behavior from the page details that remain inaccessible through
MCP. The Ringador inspection is evidence about that existing site, not a promise that the same page
can already be reproduced safely on another website.

## Confirmed behavior

### It is a normal Modern V2 page

Ringador (website `167`) has a published page `3043` at `/checkout`, with effective template `268`.
The page is an ordinary `page` with `system_page_type` unset. Its route is not a reserved checkout
route: Runtime sends unmatched GET and POST paths to `WebsitesController.index`, resolves the
website/domain and locale, then resolves the path slug against the website's pages and its
translation for the selected locale.

Source: `elemsio-runtime/start/routes.ts` (`Route.get('*')`, `Route.post('*')`);
`elemsio-runtime/app/Controllers/Http/WebsitesController.ts` (`index`).

For a Modern V2 page, `index` loads the effective template and the published page/template element
functions, builds their runtime data contexts, and renders the published page and template content.
Both page-owned and template-owned functions are supported by this renderer; the source inspection
does not establish which owner contains Ringador's checkout form.

Source: `elemsio-runtime/app/Controllers/Http/WebsitesController.ts` (`index`, V2 rendering and
`getRuntimeElementFunctions` call around the page/template function query).

### Checkout uses existing ecommerce functions

The Runtime recognizes these generic function types in the V2 renderer:

- `cart` reads and hydrates the website's current cart and payment configuration;
- `shippingCountries` supplies the country options used by checkout shipping UI;
- `paymentMethods` and `checkoutPaymentMethods` supply the configured checkout payment methods.

The Ringador template inspection confirmed a template-owned `cart` function on its “Cart section”.
The inspected “Checkout btn” is a regular anchor to `{{ base_url }}/checkout`, not a checkout
function. No dedicated `checkout` function type or checkout preset is supported by the inspected
Runtime and MCP function allowlists.

Source: `elemsio-runtime/app/Controllers/Http/WebsitesController.ts` (`index`, V2 function switch);
`elemsio-mcp-public/docs/functions.md` (public function allowlist).

### Runtime supplies shared checkout JavaScript and server actions

`appendStorefrontRuntimeScripts` calls `appendCheckoutPaymentsRuntimeScript`. The shared checkout
script activates when rendered content contains one of the recognized hooks below; it then manages
checkout UI state and sends actions to Runtime. This is generic storefront support, not evidence of a
page-specific script on page 3043.

Recognized activation markers include:

- `checkout-stripe-payment-element`
- `create_stripe_payment_intent`
- `shipping-zone-rate-options`
- `checkout-discount-code`

The script also looks for checkout regions such as `.checkout-payment-section`,
`.checkout-stripe-start-btn`, `.checkout-dynamic-shipping-section`, `.checkout-paypal-wrapper`,
`#checkout-paypal-buttons`, and `.checkout-dev-payment-wrapper`. Guest/client checkout roots and
customer, shipping, billing, payment, and shipping-rate controls are queried by the shared code.
These are Runtime integration hooks; this list is not a complete required page schema, and the source
does not establish that every hook is required on every checkout.

POST requests are routed through the same generic page handler. Runtime uses the submitted element
identifier (`eid`) to find the owning function and dispatches `cart_action` for a `cart` provider.
Existing handlers include `set_guest_checkout_details`, `get_checkout_cart`,
`set_shipping_zone_rate`, and payment actions such as `create_stripe_payment_intent` and
`create_paypal_order`/`capture_paypal_order`. Server-side cart, shipping, and payment checks remain
authoritative.

Source: `elemsio-runtime/app/Controllers/Http/WebsitesController.ts`
(`appendCheckoutPaymentsRuntimeScript`, `appendStorefrontRuntimeScripts`, `index` POST handling and
the `cart` action switch).

### Cart and locale context are preserved by Runtime

For a guest, checkout reads the cart identifier from the existing Runtime session and selects a
guest cart belonging to that website. For a signed-in client, it first checks the session cart for
that client, then falls back to a cart scoped to the current website. The checkout route does not
itself create a replacement cart. The same website session continues across locale-prefixed routes.

Runtime derives `base_url` from the selected locale and website/domain defaults. Ringador's inspected
template link uses `{{ base_url }}/checkout`; this keeps the checkout path in the current locale
context.

Source: `elemsio-runtime/app/Controllers/Http/WebsitesController.ts`
(`getActiveCheckoutCartV2`, `index` locale/base URL construction and V2 cart rendering).

## Unverified details

- `elems_get_page` confirms page 3043 exists and is published, but `elems_get_page_elements` returns
  MCP `PAGE_NOT_FOUND`. The template can be inspected; the page's exact V2 element tree cannot.
- Therefore the exact checkout element ownership, markup tree, form shape, and any page-specific
  JavaScript on page 3043 remain unverified.
- The API derives a V2 root ID from the page row, then its content-context endpoint requires a
  document with that exact ID and `type: "page"`. The endpoint returns `page_content_not_available`
  when this predicate fails. The underlying cause for page 3043—missing document, mismatched ID, or
  wrong document type—has not been confirmed from source inspection alone.
- `PAGE_NOT_FOUND` is MCP's normalized error for page-content errors. It does not mean the published
  Page record or rendered `/checkout` route is absent.
- No source evidence justifies creating a new checkout `functionType` or a checkout preset.

Source: `elemsio-api/app/Services/BaseWebsiteContextResolver.ts` (`pageIdentity`);
`elemsio-api/app/Services/PageContentContextHttpEndpoint.ts` (`resolve`, `isExactPageRoot`);
`elemsio-api/app/Services/Mcp/ElemsMcpApplication.ts` (`getPageElements`, `normalizedError`).

## Known MCP limitations

MCP can create a non-root Modern V2 draft page using an existing website-owned template, initialize
active locales, insert/import supported static structure, and update allowlisted element behaviors
and commands with compare-and-set values. Page insertion/import is normally static-only; behavior is
configured through inspected canonical targets. The published checkout is never created by the page
creation operation alone.

The current MCP content inspection path cannot read Ringador page 3043's V2 root, so it cannot
provide a verified tree to reuse. Its error normalization maps `page_content_not_available` to
`PAGE_NOT_FOUND`, obscuring the difference between an absent Page and unavailable content.

MCP supports native Page-ID destinations for menu items. Ordinary page/template anchors have
localized href editing, but no structured Page-ID destination that Runtime can resolve in the
current locale. Ringador's `{{ base_url }}/checkout` anchor is evidence of its existing link, not a
reusable native page-reference operation in MCP. Do not substitute hardcoded locale URLs or claim
that the checkout link can already be safely connected across locales.

Sources: `elemsio-mcp-public/docs/pages-and-drafts.md`, `docs/functions.md`, `docs/commands-runtime.md`,
and `docs/menus.md`; `elemsio-api/app/Services/Mcp/ElemsMcpApplication.ts` (`getPageElements`,
`normalizedError`).

## Recommended next steps

1. Make the canonical V2 source for page 3043 inspectable through the supported MCP content path, or
   expose a safe read-only inspection of its published V2 structure. Preserve the distinction
   between a missing Page and unavailable page content in the returned MCP error.
2. Once readable, verify the exact checkout tree, behavior ownership, form/action bindings, and
   whether the page has its own scripts. Document only what that readback confirms.
3. Add a reusable page-reference binding for ordinary anchors, resolved against the current locale,
   following the existing native Page destination model used by menus.
4. Only then assess whether existing static structure and native function operations can reproduce
   that verified composition on another website. Preview empty and populated carts, shipping and
   payment states, and each active locale before treating a reproduction as safe.

Until those checks are possible, do not claim that Pretzel King's checkout can already be reproduced
safely. The existing native cart is confirmed, but the checkout page structure and locale-aware
drawer-to-page binding are not.
