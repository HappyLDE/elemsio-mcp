import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { authoringDocs } from './authoring-docs.mjs'

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const args = process.argv.slice(2)
const check = args.includes('--check')
const apiArgument = args.find((argument) => !argument.startsWith('--'))
const apiRoot = path.resolve(repositoryRoot, apiArgument || '../elemsio-api')
const output = path.join(apiRoot, 'app/Services/Mcp/ElemsMcpAuthoringDocs.generated.ts')

const documents = authoringDocs.map((document) => {
  const text = fs.readFileSync(path.join(repositoryRoot, document.file), 'utf8')
  return {
    ...document,
    bytes: Buffer.byteLength(text, 'utf8'),
    sourceSha256: crypto.createHash('sha256').update(text, 'utf8').digest('hex'),
    text,
  }
})

const unformatted = `// Generated from the public HappyLDE/elemsio-mcp authoring documents.\n// Run: npm run sync:api -- [path-to-elemsio-api]\n\nexport type ElemsMcpAuthoringDoc = {\n  name: string\n  uri: string\n  title: string\n  description: string\n  file: string\n  bytes: number\n  sourceSha256: string\n  text: string\n}\n\nexport const ELEMS_MCP_AUTHORING_DOCS: ElemsMcpAuthoringDoc[] = ${JSON.stringify(
  documents,
  null,
  2
)}\n`

const prettierPath = path.join(apiRoot, 'node_modules/prettier')
if (!fs.existsSync(prettierPath)) {
  console.error(`Install the API development dependencies before synchronizing: ${prettierPath}`)
  process.exit(1)
}
const require = createRequire(import.meta.url)
const prettier = require(prettierPath)
const prettierConfig = JSON.parse(fs.readFileSync(path.join(apiRoot, '.prettierrc'), 'utf8'))
const generated = prettier.format(unformatted, { ...prettierConfig, parser: 'typescript' })

if (check) {
  if (!fs.existsSync(output) || fs.readFileSync(output, 'utf8') !== generated) {
    console.error(`Generated MCP authoring resources are stale: ${output}`)
    process.exit(1)
  }
  console.log(`MCP authoring resources are synchronized: ${documents.length} documents`)
} else {
  fs.writeFileSync(output, generated)
  console.log(`Wrote ${documents.length} MCP authoring resources to ${output}`)
}
