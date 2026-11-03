# ELEMS Checkout Composition

> **ELEMS pages are modular compositions of MdElements.** Checkout is an ordinary page assembled
> from generic elements, Runtime functions, commands, form behavior, and owned JavaScript. It is not a
> page-specific component or a special page type.

This guide uses the public storefront checkout and the read-only inspection of Ringador website
`167`, page `3043`, as a practical example. For the page and element model, see
[pages](pages-and-drafts.md) and [elements](elements.md); for the shared behavior model, see
[functions](functions.md), [commands](commands-runtime.md), and [forms](forms-and-interaction.md).

## The page and element model

Ringador's `/checkout` is a normal Modern V2 `page` with no `system_page_type`, using effective
template `268`. Its read-only source-tree inspection returned 310 nodes. The tree has a `div` root;
its main cart owner is another `div` with `functionType="cart"` and page-owned JavaScript. The
inspector describes current source; it does not certify that source as an exact snapshot of the
published page.

An MdElement independently holds its DOM type and structure, localized content and attributes,
optional `functionType`/`functionData`, commands, and owned JavaScript. Commands provide runtime
bindings, loops, and conditions within the nearest provider scope. Each element can also carry its
own classes and responsive layout. `functionType` does not choose the HTML tag: for example,
`functionType="cart"` on a `div` leaves it a `div`, and a native `form` remains separate from any
function attached to it.

The public MCP authoring surface validates and exposes only specific operations and allowlists. A
missing MCP authoring operation is not proof that the MdElement model or Runtime lacks the capability.
Report the exact authoring boundary after inspecting the existing model, Runtime behavior, and tools.

## Checkout assembled from existing capabilities

The exact elements, scopes, and state depend on the page. A checkout can compose the following
generic capabilities without introducing a checkout-specific component:

| Checkout need | Existing composition |
| --- | --- |
| Cart items and totals | A `cart` provider owns cart context and existing cart actions. Child MdElements render items, quantities, subtotal, shipping, discounts, and total through cart commands. |
| Login and registration | Existing auth/account form presets configure native login/register forms. `if:loggedIn` and `unless:loggedIn` can show the authenticated or guest branch. |
| Saved addresses | A `shippingAddresses` provider supplies the customer's saved-address loop; `shippingAddressItem*` bindings render each address, and `shippingAddressItemId` binds its ID to the selection control. |
| Current shipping address and countries | `shippingAddress` exposes current address context; `shippingCountries` supplies allowed country options. |
| Shipping rates | The cart's `cartShippingRates` loop renders available rates and selected state. A page-owned script or existing control submits the cart's `set_shipping_zone_rate` action. |
| Payment methods | `paymentMethods` or `checkoutPaymentMethods` supplies available methods. Conditions and descendant bindings render the supported Stripe or PayPal controls. |
| Conditional visibility | Commands such as `if:cartHasItems`, `unless:loggedIn`, `if:paymentMethodIsStripe`, and `if:paymentMethodIsPaypal` gate the matching elements. `urlParams` can expose route-query state where supported. |

For Ringador's inspected checkout, the guest-details form is a native HTML form with no
`functionType`. It is under the cart-owned checkout region, uses `unless:loggedIn`, and submits
`cart_action=set_guest_checkout_details` with the cart element's `eid`. The cart provider dispatches
the existing Runtime action. Saved-address selection submits `set_shipping_address` with
`shipping_address_id`; the shipping-rate control uses `set_shipping_zone_rate`. These are existing
Runtime actions, not new form types or per-site endpoints.

Storefront payment setup also uses existing cart actions: Stripe creates a payment intent and follows
the existing confirmation/finalization flow; PayPal creates an order and captures it after provider
approval. Runtime remains authoritative for cart, address, shipping, and payment validation.

The Runtime recognizes generic function types including `cart`, `shippingAddress`,
`shippingAddresses`, `shippingCountries`, `paymentMethods`, and `checkoutPaymentMethods`. It also
provides shared storefront checkout scripts when their supported page hooks are present. Page-owned
JavaScript may handle page-specific interaction using the existing Runtime contract; it does not
create a new provider or endpoint. Script source belongs to its owning MdElement and is separate from
that element's commands and `functionData`.

The shared payment script recognizes markers including `checkout-stripe-payment-element`,
`create_stripe_payment_intent`, `shipping-zone-rate-options`, and `checkout-discount-code`. It also
queries regions such as `.checkout-payment-section`, `.checkout-stripe-start-btn`,
`.checkout-dynamic-shipping-section`, `.checkout-paypal-wrapper`, and `#checkout-paypal-buttons`.
These are Runtime integration hooks, not a page-specific component or a complete required page
schema; not every checkout needs every hook.

## Authoring workflow

1. Inspect the live MCP tool schemas, focused authoring resources, current page tree, function and
   command allowlists, and Runtime actions relevant to the requested behavior.
2. Inspect an existing working page as a **read-only** reference. Use it to understand element
   structure, scopes, conditions, and existing behavior; do not modify the reference.
3. Reuse existing generic MdElements, providers, commands, native form behavior, and Runtime actions.
   Compose the smallest required page-owned structure and behavior.
4. Use the supported MCP operation for each change. Read back the source, then validate draft
   preview states, locales, and responsive layout before publication.
5. Publish only when requested, then verify the live page.

> **Do not request new platform components, endpoints, functionTypes or Core/API/MCP changes before
> verifying that the requested functionality cannot be composed using existing MdElement
> capabilities.**

If the model and Runtime support a behavior but the public MCP does not expose a safe authoring
operation, describe the missing MCP operation precisely. Do not infer that the platform itself needs
a new component, and do not work around the public authoring boundary with direct API or database
edits.

## Runtime route and action context

Modern V2 pages use the normal website page route. Runtime resolves the website, locale, page, and
effective template, then builds the page and template element-function contexts. The current website
session retains its cart across checkout rendering and locale-prefixed routes.

Runtime derives `base_url` from the selected locale and website/domain defaults. Ringador's inspected
checkout link uses `{{ base_url }}/checkout` to keep the path in the current locale context. MCP
supports native Page-ID destinations for menu items; ordinary page/template anchors currently use
localized `href` editing. See [menu authoring](menus.md) for that distinction. Do not infer a native
page-reference binding for ordinary anchors from the Ringador example.

Storefront POST actions use the owning element ID (`eid`) to find the Runtime function and dispatch
the submitted `cart_action`. Existing cart actions include `set_guest_checkout_details`,
`set_shipping_address`, `set_shipping_zone_rate`, `create_stripe_payment_intent`,
`create_paypal_order`, and `capture_paypal_order`. Server-side ownership and state checks remain
authoritative.

Sources: `elemsio-runtime/start/routes.ts` and
`elemsio-runtime/app/Controllers/Http/WebsitesController.ts` (V2 rendering, locale context,
checkout scripts and cart action dispatch); read-only MCP source-tree inspection of Ringador website
`167`, page `3043`, locale `fr`, 310 nodes (2026-11-03).
