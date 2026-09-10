import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { authoringDocs } from './authoring-docs.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
for (const document of authoringDocs) {
  const text = fs.readFileSync(path.join(root, document.file), 'utf8')
  const bytes = Buffer.byteLength(text, 'utf8')
  console.log(`${document.uri}\t${bytes} bytes\t~${Math.ceil(bytes / 4)} tokens`)
}
