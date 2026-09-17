import type { VercelRequest, VercelResponse } from '@vercel/node'

function isAllowedGreenApiHost(host: string): boolean {
  const normalized = host.trim().toLowerCase()
  return (
    normalized === 'api.green-api.com' ||
    /^\d+\.api\.green-api\.com$/.test(normalized)
  )
}

export const config = {
  maxDuration: 60,
  api: {
    bodyParser: false,
  },
}

async function readRawBody(req: VercelRequest): Promise<Buffer | undefined> {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE') {
    return undefined
  }

  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const pathParam = req.query.path
  const parts = (Array.isArray(pathParam) ? pathParam : [pathParam]).filter(
    Boolean,
  ) as string[]

  const host = parts[0]
  const rest = parts.slice(1).join('/')

  if (!host || !isAllowedGreenApiHost(host)) {
    res.status(400).json({ error: 'Invalid GREEN-API host' })
    return
  }

  const searchIndex = req.url?.indexOf('?') ?? -1
  const search = searchIndex >= 0 ? req.url!.slice(searchIndex) : ''
  const target = `https://${host}/${rest}${search}`

  try {
    const body = await readRawBody(req)
    const headers: Record<string, string> = {}
    if (req.headers['content-type']) {
      headers['Content-Type'] = String(req.headers['content-type'])
    }

    const upstream = await fetch(target, {
      method: req.method,
      headers,
      body,
    })

    const text = await upstream.text()
    res.status(upstream.status)
    const contentType = upstream.headers.get('content-type')
    if (contentType) res.setHeader('Content-Type', contentType)
    res.send(text)
  } catch (error) {
    res.status(502).json({
      error: 'GREEN-API proxy failed',
      details: error instanceof Error ? error.message : String(error),
    })
  }
}
