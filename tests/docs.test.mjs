import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { authoringDocs } from '../scripts/authoring-docs.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8')

test('authoring documents are focused, bounded, and uniquely routed', () => {
  assert.equal(authoringDocs.length, 14)
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
})

test('public documents contain no consumer-irrelevant operational material', () => {
  const corpus = authoringDocs.map(({ file }) => read(file)).join('\n')
  assert.doesNotMatch(corpus, /\/home\/|ssh\s|mongodb:\/\/|mysql:\/\/|BEGIN [A-Z ]*PRIVATE KEY/)
  assert.doesNotMatch(corpus, /deploy(?:ment)? lock|nginx|pm2|production topology/i)
})
