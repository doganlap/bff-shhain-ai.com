// Vercel API Route - Proxy to BFF (serverless)
// Proxies all /api/* requests to the configured BFF origin

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, X-Tenant-ID')
    res.status(204).end()
    return
  }

  try {
    const bff = process.env.BFF_URL || process.env.VITE_API_BASE_URL || 'http://localhost:3005/api'
    const url = new URL(req.url, 'http://localhost')
    const path = url.pathname.replace(/^\/api/, '') || '/'
    const target = `${bff}${path}${url.search}`

    const headers = { ...req.headers }
    delete headers['host']

    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : await new Promise((resolve) => {
      const chunks = []
      req.on('data', (c) => chunks.push(c))
      req.on('end', () => resolve(Buffer.concat(chunks)))
    })

    const response = await fetch(target, {
      method: req.method,
      headers,
      body,
    })

    const buf = Buffer.from(await response.arrayBuffer())
    res.status(response.status)
    for (const [key, value] of response.headers) {
      if (key.toLowerCase() === 'transfer-encoding') continue
      res.setHeader(key, value)
    }
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.send(buf)
  } catch (err) {
    res.status(502).json({ success: false, error: 'Bad Gateway', message: err.message })
  }
}
