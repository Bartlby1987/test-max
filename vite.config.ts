import react from '@vitejs/plugin-react'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, type Plugin } from 'vite'

function isAllowedGreenApiHost(host: string): boolean {
  const normalized = host.trim().toLowerCase()
  return (
    normalized === 'api.green-api.com' ||
    /^\d+\.api\.green-api\.com$/.test(normalized)
  )
}

function greenApiDevProxy(): Plugin {
  return {
    name: 'green-api-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        const rawUrl = req.url || ''
        if (!rawUrl.startsWith('/api/ga/')) {
          next()
          return
        }

        try {
          const parsed = new URL(rawUrl, 'http://localhost')
          const segments = parsed.pathname.replace(/^\/api\/ga\//, '').split('/')
          const host = decodeURIComponent(segments[0] || '')
          const rest = segments.slice(1).join('/')

          if (!isAllowedGreenApiHost(host)) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Invalid GREEN-API host' }))
            return
          }

          const target = `https://${host}/${rest}${parsed.search}`
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
          }
          const body =
            req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE'
              ? undefined
              : Buffer.concat(chunks)

          const upstream = await fetch(target, {
            method: req.method,
            headers: req.headers['content-type']
              ? { 'Content-Type': String(req.headers['content-type']) }
              : undefined,
            body,
          })

          res.statusCode = upstream.status
          const contentType = upstream.headers.get('content-type')
          if (contentType) res.setHeader('Content-Type', contentType)
          res.end(Buffer.from(await upstream.arrayBuffer()))
        } catch (error) {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(
            JSON.stringify({
              error: 'GREEN-API proxy failed',
              details: error instanceof Error ? error.message : String(error),
            }),
          )
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), greenApiDevProxy()],
})
