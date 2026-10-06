# Ecommerce Authoring

Load this resource only for products, pricing, cart/checkout, orders, promotions, or purchase-gated
content.

## Catalog and product presentation

Use `elems_list_products` and `elems_get_product` to resolve canonical same-website products and
variants. Product catalog values are not ordinary page copy:

- `elems_update_product_pricing` performs compare-and-set pricing changes on one exact variant;
- `elems_update_product_name` changes one locale's product-name draft;
- `elems_update_product_variant_resource_grants` replaces only the sanitized future `md_post` grant
  configuration and preserves unrelated/reserved variant metadata.

Pricing is read live from the canonical variant row; it has no page draft/publication step. Do not
hardcode canonical price or compare-at values into page text. Compare-at display is meaningful only
while canonical compare-at price is greater than price.

For an eligible editorial card, attach one inspected product using
`elems_update_element_product_context` and its fresh context hash. Then use only mutable descendant
`dynamic_binding_targets[]` with `elems_update_element_dynamic_binding` for current or compare-at
price. Dedicated tools hide raw `functionType`, `functionData`, and commands. Use ordinary class tools
for presentation.

## Runtime composition

Current generic ecommerce providers include `productsCollection`, `productSearch`, `product`, `cart`,
`shippingCountries`, `shippingAddress`, `shippingAddresses`, `paymentMethods`, and
`checkoutPaymentMethods`. Orders use `clientOrders` and `clientOrderDetail`; the bounded auth/account
preset tool is preferred for account pages. Load `elems://docs/functions` and
`elems://docs/commands` only when composing or diagnosing these dynamic trees.

Place loop commands inside the matching provider scope and keep product, collection/search-item,
cart-item, address, payment-method, and order-item contexts separate. Do not convert a collection or
search loop into a direct-product card by writing an ID. Preview populated, empty, invalid-query,
unauthenticated, and unavailable-payment states when the task affects them.

Checkout/payment behavior is generic platform functionality. Do not expose or set provider
credentials, raw payment endpoints, internal payment data, sessions, or customer identity. Do not
modify orders or historical access grants through authoring tools.

## Website currency

Use `elems_list_shipping_countries` to inspect the current Website currency context and its
`currency_revision`. Then use `elems_add_website_currency` with a canonical currency code and that
fresh revision. When no default currency exists, the added currency becomes the Website default. When
a default already exists, the tool adds an available currency without changing the default. Duplicate
currencies are rejected, matching the Settings flow. The tool uses the existing shared currency
catalog and Website Settings persistence; it does not migrate product prices, orders, or payments.

## Promotions and purchased resources

Website owners can inspect canonical shipping-country and zone configuration with
`elems_list_shipping_countries`, then add or update one supported country with
`elems_configure_shipping_country` using the fresh website configuration revision. Costs use major
units of the website currency; zero is valid. The tools operate on the existing shipping-zone model
that feeds Runtime `shippingCountries`. Shared-zone, legacy-rate, duplicate, catch-all, or otherwise
ambiguous settings are rejected when a targeted update could affect another country. Removal is
available only for an isolated matching zone with no rates, carts, or orders.

Promo tools list, create, and CAS-update website-scoped global percentage codes. Quote with
`elems_quote_promo_code`; clients never supply or calculate the authoritative discount amount.

Variant resource grants configure future confirmed-purchase materialization only. They do not change
existing OrderItem snapshots or historical `ResourceAccessGrant` rows. Render purchased resources
with an inspected posts function using `access_mode="granted"`.

Ownership remains website/entity scoped throughout. If a required catalog, checkout, payment, order,
or variant operation is not exposed, report that limitation; do not use admin procedures or private
provider details.

## Internal TEST resource checkout

`elems_configure_test_product_checkout` accepts an existing unpublished digital TEST product and
exact expected minor-unit price, visibility, and resource-grant hash. It preserves unrelated
variant metadata, marks `test_checkout` version 1/enabled, and makes the product purchasable only
by `commerce_qa` accounts. Draft translations remain unpublished. Runtime denies live payment
for these products. This operation cannot create an account, order, payment, or entitlement.

Publish a page-owned empty `cart` provider with `presentation="resource_checkout"` and `productId`
using the canonical element behavior tool. It renders the current catalog price, TEST indicator,
buyer identity, one-access cart, unpaid-order creation and cancellation, and payment availability.
Pending orders freeze their selection; cancel and start another cart to change it. Resource
entitlements are created only by server-verified paid-order completion, linked to OrderItem.
A missing sandbox is an external configuration boundary; never emulate a paid production order.

## Complete existing-Product commercialization

MCP 1.51.0 exposes 77 tools. Use `elems_get_product` with the intended locale. Its `product.authoring`
contains `contract_version=product-commercialization.v1`, `authoring_hash`, `locale_code`, `type`,
`subtype`, `slug`, `visibility`, `default_variant_id`, `currency`, `draft`, `published_presentation`,
`published`, `has_changes`, `cover`, `gallery_media_ids`, `variants`, and `readiness`. This is the
authoritative commercial inspection; the older top-level name/pricing fields remain compact conveniences.
Draft and published content are separate. An absent locale draft is `null`; provide a name when creating
its presentation. Readback can contain existing canonical rich content, but new presentation input is
plain text. No raw HTML, Liquid or arbitrary styles are accepted.

The one `elems_update_product` operation union always requires `website_id`, `product_id`,
`locale_code`, and the exact fresh `expected_authoring_hash`:

| operation | Explicit payload | Effect |
| --- | --- | --- |
| `presentation` | nonempty `presentation` patch: `name`, `description`, `benefits_description`, `long_description`, `meta_description` | Draft-only localized canonical Product presentation |
| `cover` | `expected_cover_media_id` and `media_id`: same-Website image ID or `null` | Replace/add canonical first Product image; remove inspected cover; move inherited Variant images |
| `commercial` | any of `visibility` (0/1/2), `default_variant_id`, `variant` | Immediately live existing commerce controls |
| `publication` | `published`: boolean | Publish current selected-locale draft snapshot, or unpublish selected locale |

`variant` requires its exact `id` and one or more of `customer_eligibility` (`ordinary`/`qa_only`),
`track_quantity` (boolean), `stock` (nonnegative integer), `restock_type` (`none`/`delay`/`date`),
`restock_delay_days` or `restock_date` (ISO timestamp with timezone or null). A delay needs positive
days; a date needs a valid timestamp. Default Variant must belong to this Product, Website and Entity.
There is no separate Product or Variant enabled field in ELEMS. Visibility 0 hides/disables the
Product; Variant availability follows canonical tracking/stock/restock. Visibility 1 is catalog;
visibility 2 is direct-link/private. Catalog visibility also requires published presentation.

Cover uses existing Media, never a URL or duplicate Media record. Image types are jpg/jpeg/png/webp/
gif/avif/svg. Replacement preserves other gallery members and explicit Variant image overrides.
Clearing removes the inspected cover relationship and promotes the next gallery image, if any.
Pass its fresh `expected_cover_media_id` (null when absent). Inherited Variant images follow the
resulting cover; gallery siblings are preserved. The explicit prior ID makes retries idempotent.

`customer_eligibility=ordinary` removes only the existing `test_checkout` metadata gate. `qa_only`
sets that same gate and requires a priced digital resource Variant. QA checkout requires a canonical
QA buyer and sandbox payments. Neither operation changes payment-provider configuration, grants,
historical OrderItems or existing entitlements. Existing TEST name/slug are not a second eligibility
gate; replace customer-facing presentation deliberately. Slug is preserved.

Keep using `elems_update_product_pricing` for major-unit price/compare-at changes and its exact
expected pair; omit Variant ID only to target the canonical default. Currency is Website-wide:
inspect `elems_list_shipping_countries.currency_revision` and use `elems_add_website_currency` if no
default exists. It accepts only existing catalog currencies and cannot convert prices or replace an
existing default. Product publication does not stage/release pricing, cover, inventory or visibility.

### Canonical sequence

1. Resolve Website and existing draft Product; read the intended locale and all Variant identities.
2. Author localized presentation; read again after every mutation.
3. Associate existing cover Media; set/reuse the real Website currency and Variant prices.
4. Set default Variant, canonical availability and visibility; remove QA restriction for each Variant
   offered to ordinary customers. Resource associations remain a separate explicit grants operation.
5. Inspect draft/published differences, readiness, and customer-dependent requirements.
6. Explicitly publish each intended active locale using its fresh hash.
7. Read customer readiness separately from persisted provider configuration. Compose/qualify the
   existing storefront through its normal page/provider tools; Product authoring does not create pages.
8. Unpublish/republish deliberately when required. Publication updates the selected locale only.

### Readiness diagnosis

`readiness.customer_product_ready` requires the selected locale published, visibility >0, an owned
default Variant, positive integer price, currency, available stock/preorder and ordinary eligibility.
`catalog_visible` requires visibility=1 and published; `direct_link_visible` requires visibility>0 and
published. These presentation booleans do not prove availability. `default_variant_available` and
`ordinary_customer_eligible` explain those separate controls.

`product_blockers` includes `draft_unpublished`, `product_hidden`, `invalid_visibility`,
`default_variant_missing`, `invalid_price`, `stock_unavailable`, `qa_test_restricted`,
`invalid_checkout_metadata`, and `currency_unavailable` where applicable. Every Variant also exposes
its own `blockers`, inventory state, `customer_eligibility`, `resource_grants` and `resource_grants_hash`.
No artificial enabled/disabled fields are writable.

`payment_provider.scope=persisted_website_connections` exposes live/sandbox `configured` booleans
and safe per-provider/mode blockers. Missing connections are an empty list and both configured flags
are false. It never exposes credentials or provider account identities. `runtime_configuration_checked`
and `provider_contact_performed` are false: Runtime environment and live provider availability are not
proven by this inspection. `checkout_requirements` reports missing live provider configuration,
Runtime payment configuration, physical shipping, or resource account/quantity/ownership requirements.
A Product can be customer-ready while payments remain unavailable. Customer-specific ownership/auth
is not guessed. `payment_success_evaluated=false` and `entitlement_evaluated=false` preserve the boundary.

### Concurrency and commerce isolation

Every authoring operation compares the complete opaque authored state under canonical MySQL locks.
Do not construct the hash. A stale conflicting write returns CONFLICT; read again before deciding
what to change. A same-value retry returns `already_current` without rewriting newer unrelated fields.
Concurrent conflicting edits serialize. Pricing uses its separate exact expected pair and supports
same-value retry. Foreign Product/Variant/Media, wrong Entity, inactive locale and arbitrary fields fail
closed. Presentation, cover, publication and commercial edits preserve resource/fulfillment mappings.

PRODUCT AUTHORED ≠ PRODUCT PUBLISHED ≠ CUSTOMER ELIGIBLE ≠ PAYMENT PROVIDER READY ≠ ORDER PAID ≠ RESOURCE ENTITLEMENT.

Authoring/readiness creates no cart, order, payment, webhook, purchase history, entitlement or customer,
and never calls Stripe/PayPal. Use the normal checkout/confirmed-payment fulfillment flow separately.
Qualification uses run-owned disposable Website lifecycle provisioning/retirement; never modify a
customer Website to test the tool. Retire all disposable Product/Variants/Media/resources with the
canonical Website cleanup, including public storage objects.

`readiness.website_online_payments` reuses the canonical Website subscription capability: it reports
`subscription_eligible`, `subscription_reason`, and `runtime_enforcement_checked=false`. A missing
subscription adds `subscription_required_for_online_payments` to `checkout_requirements`. This is
separate from Product/customer readiness and persisted provider configuration; it never changes a
subscription or proves Runtime enforcement/configuration. The existing `elems_get_context.ecommerce`
also exposes `online_payments_available`.
