import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { authoringDocs } from '../scripts/authoring-docs.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('authoring documents are focused, bounded, and uniquely routed', () => {
  assert.equal(authoringDocs.length, 16)
  assert.equal(new Set(authoringDocs.map(({ uri }) => uri)).size, authoringDocs.length)
  assert.equal(new Set(authoringDocs.map(({ name }) => name)).size, authoringDocs.length)

  for (const document of authoringDocs) {
    const text = read(document.file)
    assert.ok(Buffer.byteLength(text, 'utf8') <= 20_000, `${document.file} exceeds 20 KB`)
    assert.match(text, /^# /)
    assert.ok(document.description.length >= 30)
  }

  assert.ok(Buffer.byteLength(read('AGENT_GUIDE.md'), 'utf8') <= 6_000)
  assert.ok(Buffer.byteLength(read('docs/index.md'), 'utf8') <= 6_000)
})

test('small index routes every focused resource without embedding their contents', () => {
  const index = read('docs/index.md')
  for (const { uri } of authoringDocs.filter(
    ({ uri }) => !uri.endsWith('/agent-guide') && !uri.endsWith('/index')
  )) {
    assert.match(index, new RegExp(uri.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
  assert.match(index, /Do not load merely for/)
  assert.doesNotMatch(index, /clientOrderDetailShippingPhoneNumber/)
  assert.doesNotMatch(index, /event_registration/)
})

test('default guide contains universal rules rather than the authoring corpus', () => {
  const guide = read('AGENT_GUIDE.md')
  assert.match(guide, /suggested_inspection_root/)
  assert.match(guide, /destructive intent/)
  assert.match(guide, /ELEMS Media/)
  assert.match(guide, /stop and report the missing platform capability/i)
  assert.doesNotMatch(guide, /productsCollectionItems|clientOrderDetail|PostIdentifier|formType/)
})

test('important authoring rules stay in their owning documents', () => {
  assert.match(read('docs/elements.md'), /found element is\s+only a location/i)
  assert.match(read('docs/pages-and-drafts.md'), /suggested_inspection_root != mutation authority/)
  assert.match(read('docs/styling-tailwind.md'), /does not guarantee.*utility.*effective stylesheet/is)
  assert.match(read('docs/media.md'), /Audio and video are not accepted/)
  assert.match(read('docs/localization.md'), /current_value: null/)
  assert.match(read('docs/templates-and-ownership.md'), /shared_prefab/)
  const pages = read('docs/pages-and-drafts.md')
  assert.match(pages, /`elems_update_page`/)
  assert.match(pages, /stable `page_id`/)
  assert.match(pages, /atomic/)
  assert.match(pages, /case-insensitively/)
  assert.match(pages, /native\s+Menu Page destinations/is)
  assert.doesNotMatch(pages, /cannot .*rename|cannot .*mutate an existing slug/i)
})

test('public documents contain no consumer-irrelevant operational material', () => {
  const corpus = authoringDocs.map(({ file }) => read(file)).join('\n')
  assert.doesNotMatch(corpus, /\/home\/|ssh\s|mongodb:\/\/|mysql:\/\/|BEGIN [A-Z ]*PRIVATE KEY/)
  assert.doesNotMatch(corpus, /deploy(?:ment)? lock|nginx|pm2|production topology/i)
})

const publicMarkdown = [
  ...new Set([
    ...authoringDocs.map(({ file }) => file),
    'README.md',
    'SECURITY.md',
    'ONBOARDING_TEST.md',
    'CLAUDE.md',
  ]),
]

// SHA-256 of known tenant/project names (lowercase letters and digits only, words joined), so the
// denylist itself discloses nothing. Single words and adjacent word pairs are checked.
const disclosedNameHashes = new Set([
  '6669c0eaf969f2e8bd88c478c6656550b48e75df4addd5c13ac57e73f3fc7d74',
  '5947cd7dadde2627f46142da77b3f40ef7be278779980cc580c928eeb7ad60d7',
  '9d81e808f4c3d66a8476d0b8f600ea7c5a92ef5e70cdc8d06f75c6e9bda3eec2',
])
const sha256 = (value) => crypto.createHash('sha256').update(value, 'utf8').digest('hex')

test('public documents name no known tenant or customer project', () => {
  for (const file of publicMarkdown) {
    const words = read(file).toLowerCase().match(/[a-z0-9]+/g) || []
    words.forEach((word, index) => {
      for (const candidate of [word, word + (words[index + 1] || '')]) {
        assert.ok(!disclosedNameHashes.has(sha256(candidate)), `${file} names a known tenant near "${word}"`)
      }
    })
  }
})

test('public documents contain no tenant identifiers, source paths, or private hosts', () => {
  for (const file of publicMarkdown) {
    const text = read(file)
    // Concrete numeric record identifiers such as "website 167", "page `3043`", "template ID 268".
    assert.doesNotMatch(
      text,
      /\b(?:website|page|template|entity|product|variant|menu|order|post|event|media)s?\s+(?:id\s+)?`?\d{2,}\b/i,
      `${file} contains a concrete record identifier`
    )
    // Internal repository or source-file references.
    assert.doesNotMatch(text, /\belemsio-(?:api|runtime|modern|mail|ai-ops|pos|tw-jit|mcp-public)\b/, file)
    assert.doesNotMatch(
      text,
      /\b(?:app|start|config|database|providers)\/[\w./-]+\.(?:ts|js|mjs|json)\b|Controllers\/Http|\w+Controller\.\w+/,
      `${file} references private source files`
    )
    // Local machine paths.
    assert.doesNotMatch(text, /(?:^|[\s`(])(?:\/home\/|\/Users\/|\/opt\/|\/root\/|[A-Z]:\\Users\\)/m, file)
    // Only documented public ELEMS hosts.
    for (const [host] of text.matchAll(/\b[\w-]+(?:\.[\w-]+)*\.(?:elems\.io|myelems\.com)\b/g)) {
      assert.ok(['api.elems.io', 'app.elems.io'].includes(host), `${file} names non-public host ${host}`)
    }
  }
})

test('checkout document keeps its public Runtime contracts', () => {
  const checkout = read('docs/checkout.md')
  for (const contract of [
    'cart',
    'shippingCountries',
    'paymentMethods',
    'checkoutPaymentMethods',
    '{{ base_url }}/checkout',
    'checkout-stripe-payment-element',
    'create_stripe_payment_intent',
    'shipping-zone-rate-options',
    'checkout-discount-code',
    '.checkout-payment-section',
    '#checkout-paypal-buttons',
    'eid',
    'cart_action',
    'set_guest_checkout_details',
    'get_checkout_cart',
    'set_shipping_zone_rate',
    'create_paypal_order',
    'capture_paypal_order',
    'PAGE_NOT_FOUND',
  ]) {
    assert.ok(checkout.includes(contract), `checkout.md lost ${contract}`)
  }
  assert.match(checkout, /no dedicated `checkout` function type/i)
  assert.match(checkout, /Do not substitute hardcoded locale URLs/)
})

// Resources registered by the MCP server itself rather than synchronized from this repository.
const serverRegisteredResources = new Set(['elems://docs/markup-v1'])

test('every elems://docs link names a registered resource', () => {
  const registered = new Set([...authoringDocs.map(({ uri }) => uri), ...serverRegisteredResources])
  for (const file of publicMarkdown) {
    for (const [uri] of read(file).matchAll(/elems:\/\/docs\/[\w-]+/g)) {
      assert.ok(registered.has(uri), `${file} links unregistered resource ${uri}`)
    }
  }
})

test('public documents describe guarantees without storage-engine or milestone names', () => {
  for (const file of publicMarkdown) {
    const text = read(file)
    assert.doesNotMatch(text, /\bMongo(?:DB)?\b|\bMySQL\b|\bSQL\b|\bStage\s+3A\b|\belement_functions\b/, file)
  }
  // Safety-critical event guarantees remain documented after the terminology change.
  const forms = read('docs/forms-and-interaction.md')
  assert.match(forms, /protected admission barrier enforces published capacities atomically/)
  assert.match(forms, /admission rejects full selections atomically/)
  assert.match(forms, /published atomically under protected admission gate, page and session locks/)
  assert.match(forms, /in the same transaction as all locale page artifacts/)
  assert.match(forms, /Do not rely on seat limits until `elems_get_event_registration_readiness` verifies/)
  assert.match(read('docs/functions.md'), /MCP Event configuration does not edit capacity/)
  assert.match(read('docs/pages-and-drafts.md'), /serializes under a lock on the canonical translation record/)
  assert.match(read('docs/ecommerce.md'), /under canonical record locks/)
})
