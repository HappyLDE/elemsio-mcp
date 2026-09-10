# Commands and Runtime Expressions

Load this resource for runtime values, loops, or conditional rendering. Commands are allowlisted
metadata compiled by ELEMS; they are not arbitrary Liquid or JavaScript.

## Representation

An element's `commands` is a flat string map. In behavior updates the keys are command names such as
`websiteName` or `if:loggedIn`. In behavior-capable Markup V1 they appear as `cmd.<name>` attributes:

```text
0 div "Account" cmd.if:loggedIn=""
  1 span "Email" cmd.userEmail=""
```

The value is either empty or a pipe-separated list of allowlisted parameters:

- `loop:` repeats that element and its subtree over the command's runtime collection.
- `prop:<attribute>` writes the runtime value to an allowlisted attribute instead of text.
- On a conditional command, `append:<literal>` appends to a property and `value:<literal>` replaces it.
- `name:<field>` is accepted only for canonical form-input/check-state bindings.
- `size:<variant>` selects an allowed image size where supported.
- `if:<condition>` and `unless:<condition>` wrap the element, or conditionally affect `prop`.

Commands resolve within runtime scopes established by the relevant `functionType` and loop. Place a
provider on the containing component, its collection-loop command on the repeated child, and
item-value commands inside that repeated subtree. Do not reference a value outside its provider/loop
context. Nested loops follow the documented hierarchy (for example menu -> submenu or product variant
name -> values).

```text
0 nav "Locales" fn="locales"
  1 a "Locale option" cmd.localeItems="loop:" cmd.localeUrl="prop:href" cmd.localeLang="prop:lang" cmd.if:localeIsCurrent="prop:class|append:font-bold"
    2 span "Code" cmd.localeCode=""
```

For locale selectors and product price bindings, prefer their dedicated tools rather than composing
raw commands.

## Current command allowlist

The following names are the external behavior validator's complete current allowlist. A name being
allowlisted does not create its required function, catalog object, session, cart, or content source.

<!-- public-commands:start -->
```text
append websiteName templateCssUrl formInput userEmail currentYear pageTitle pageMetaDescription
pageOgImage localeCode localeName localeUrl localeLang localeHrefLang localeIconUrl localeIsCurrent
currentLocaleCode currentLocaleName currentLocaleIconUrl localeItems menuName menuItems menuItemName
menuItemUrl menuItemHasChildren menuSubItems menuSubItemName menuSubItemUrl menuSubItemHasChildren
menuSubSubItems menuSubSubItemName menuSubSubItemUrl collectionName productsCollectionName
productsCollectionItems productsCollectionItemProductName productsCollectionItemMetaDescription
productsCollectionItemProductPrice productsCollectionItemProductPriceCompare
productsCollectionItemProductDiscountAmount productsCollectionItemProductDiscountPercent
productsCollectionItemMainImageUrl productsCollectionItemUrl productsCollectionTotal
productsCollectionCurrentPage productsCollectionLastPage productsCollectionHasMultiplePages
productsCollectionHasNextPage productsCollectionHasPreviousPage productsCollectionNextPageUrl
productsCollectionPreviousPageUrl productsCollectionPaginationPages
productsCollectionPaginationPageNumber productsCollectionPaginationPageUrl
productsCollectionPaginationPageIsCurrent productSearchQuery productSearchResults productSearchEmpty
productSearchHasQuery productSearchMissingQuery productSearchHasResults productSearchTotal
productSearchCurrentPage productSearchLastPage productSearchHasMultiplePages productSearchHasNextPage
productSearchHasPreviousPage productSearchNextPageUrl productSearchPreviousPageUrl
productSearchPaginationPages productSearchPaginationPageNumber productSearchPaginationPageUrl
productSearchPaginationPageIsCurrent productSearchItemProductName productSearchItemMetaDescription
productSearchItemProductPrice productSearchItemProductPriceCompare
productSearchItemProductDiscountAmount productSearchItemProductDiscountPercent
productSearchItemMainImageUrl productSearchItemUrl productId productName productDescription
productLongDescription productBenefitsDescription productMetaDescription productPrice
productPriceCompare productDiscountAmount productDiscountPercent productMainImageUrl productUrl
productDefaultVariantId productImages productImageUrl productVariantNames productVariantName
productVariantValues productVariantValueId productVariantValueVal productVariantValueImage
productVariantValueImageUrl productVariantChosenValueId productVariantChosenValueVal
productVariantPreorderDate shippingCountries shippingCountryISOCode shippingCountryName countryCode
shippingAddressFirstname shippingAddressLastname shippingAddressFullName shippingAddressPhoneNumber
shippingAddressStreet shippingAddressStreetInfo shippingAddressCity shippingAddressState
shippingAddressCountry shippingAddressCountryCode shippingAddressZipcode shippingAddressIsDefault
shippingAddresses shippingAddressItemFirstname shippingAddressItemLastname shippingAddressItemFullName
shippingAddressItemPhoneNumber shippingAddressItemStreet shippingAddressItemStreetInfo
shippingAddressItemCity shippingAddressItemState shippingAddressItemCountry shippingAddressItemZipcode
shippingAddressItemIsDefault shippingAddressItemIsInCart clientOrders clientOrdersHasItems
clientOrdersEmpty clientOrdersHasMultiplePages clientOrdersHasNextPage clientOrdersHasPreviousPage
clientOrdersTotal clientOrdersCurrentPage clientOrdersLastPage clientOrderIdentifier clientOrderNumber
clientOrderDate clientOrderCreatedAt clientOrderStatus clientOrderStatusFormatted
clientOrderPaymentStatus clientOrderPaymentStatusFormatted clientOrderTotalFormatted
clientOrderCurrency clientOrderItemsCount clientOrderDetailFound clientOrderDetailMissing
clientOrderDetailHasItems clientOrderDetailHasDiscounts clientOrderDetailIdentifier
clientOrderDetailNumber clientOrderDetailDate clientOrderDetailCreatedAt clientOrderDetailStatus
clientOrderDetailStatusFormatted clientOrderDetailPaymentStatus
clientOrderDetailPaymentStatusFormatted clientOrderDetailSubtotalFormatted
clientOrderDetailShippingAmountFormatted clientOrderDetailTotalFormatted clientOrderDetailCurrency
clientOrderDetailItemsCount clientOrderDetailShippingFullName clientOrderDetailShippingStreet
clientOrderDetailShippingStreetInfo clientOrderDetailShippingCity clientOrderDetailShippingState
clientOrderDetailShippingZipcode clientOrderDetailShippingCountryCode
clientOrderDetailShippingPhoneNumber clientOrderItems clientOrderItemTitle clientOrderItemVariant
clientOrderItemQuantity clientOrderItemPriceFormatted clientOrderItemTotalFormatted clientOrderItemImage
cartHasItems cartIsEmpty cartHasShippingAddress cartMissingShippingAddress cartHasShippingRates
cartMissingShippingRates cartShippingUnavailableForCountry cartItems cartItemsCount cartSubtotalFormatted
cartShippingAddressFirstname cartShippingAddressLastname cartShippingAddressFullName
cartShippingAddressPhoneNumber cartShippingAddressStreet cartShippingAddressStreetInfo
cartShippingAddressCity cartShippingAddressState cartShippingAddressCountry cartShippingAddressZipcode
cartShippingFormatted cartTotalFormatted cartItemId cartItemVariantId cartItemProductUrl cartItemImageUrl
cartItemName cartItemVariantName cartItemSelectedOptions cartItemQuantity cartItemPriceFormatted
cartItemTotalFormatted cartShippingRates cartShippingRateId cartShippingRateName
cartShippingRateDescription cartShippingRatePrice cartShippingRatePriceFormatted
cartShippingRateIsSelected paymentMethods checkoutPaymentMethods hasPaymentMethods paymentMethodKey
paymentMethodProvider paymentMethodName paymentMethodDescription paymentMethodIcon paymentMethodIsStripe
paymentMethodIsPaypal paymentMethodIsDevPayment paymentUnavailableMessage loggedIn urlParams formSuccess
formError formCaptchaFailed formClientExistsWithEmail formInvalidEmail formInvalidEmailOrPassword
formInvalidShippingCountry formItemIsChecked
```
<!-- public-commands:end -->

Loop-capable commands are `productsCollectionItems`, `productsCollectionPaginationPages`,
`productSearchResults`, `productSearchPaginationPages`, `localeItems`, `menuItems`, `menuSubItems`,
`menuSubSubItems`, `shippingCountries`, `shippingAddresses`, `clientOrders`, `clientOrderItems`,
`cartItems`, `cartShippingRates`, `paymentMethods`, `checkoutPaymentMethods`, `productImages`,
`productVariantNames`, and `productVariantValues`.

Conditional commands are the boolean/status subset accepted by inspection and validation, including
session (`loggedIn`), URL parameter checks, empty/has-items and pagination flags, form result flags,
cart/address/payment state, menu-child state, locale current state, and compare-at/image presence.
The tool validator is authoritative for the exact subset and parameters.

## Common mistakes

- Do not put Liquid expressions in content, attributes, command values, or `functionData`.
- Do not invent command names, parameters, runtime variables, or nested objects.
- An empty command value means “render the bound value as content”; it does not mean missing setup.
- Only loop-capable commands accept `loop:` and only condition-capable commands accept `if:`/`unless:`.
- Conditional literals are bounded safe text and cannot contain markup, quotes, braces, or template syntax.
- Keep commands under the correct provider and loop scope; preview both populated and empty states when possible.
