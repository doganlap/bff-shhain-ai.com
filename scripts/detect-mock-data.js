const fs = require('fs')
const path = require('path')

const root = path.resolve(__dirname, '..')
const target = path.join(root, 'apps', 'web', 'src')

const excludeDirs = [
  path.join(target, 'pages', 'demo'),
  path.join(target, 'components', 'dev'),
  path.join(target, '__tests__'),
  path.join(target, 'services', 'regulatory-intelligence-service-ksa')
]

const patterns = [
  /\bfaker\b/i,
  /\bmock\b/i,
  /\bmsw\b/i,
  /\bdummy\b/i,
  /\bplaceholder\b/i,
  /TODO[_-]?MOCK/i
]

let issues = []

function walk(dir) {
  if (excludeDirs.some(ex => dir.startsWith(ex))) return
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      walk(p)
    } else if (e.isFile()) {
      if (p.includes('node_modules')) continue
      if (!/\.(js|jsx|ts|tsx|json|md)$/.test(e.name)) continue
      const content = fs.readFileSync(p, 'utf8')
      for (const re of patterns) {
        if (re.test(content)) {
          issues.push({ file: p, pattern: re.toString() })
          break
        }
      }
    }
  }
}

walk(target)

if (issues.length) {
  console.error('Mock data patterns found:')
  for (const i of issues) console.error(`- ${i.file} matched ${i.pattern}`)
  process.exit(1)
} else {
  console.log('No mock data patterns detected in production code.')
}