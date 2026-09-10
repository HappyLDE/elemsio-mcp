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

## Promotions and purchased resources

Promo tools list, create, and CAS-update website-scoped global percentage codes. Quote with
`elems_quote_promo_code`; clients never supply or calculate the authoritative discount amount.

Variant resource grants configure future confirmed-purchase materialization only. They do not change
existing OrderItem snapshots or historical `ResourceAccessGrant` rows. Render purchased resources
with an inspected posts function using `access_mode="granted"`.

Ownership remains website/entity scoped throughout. If a required catalog, checkout, payment, order,
or variant operation is not exposed, report that limitation; do not use admin procedures or private
provider details.
