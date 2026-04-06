import { createServer, request as httpRequest } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const rootDir = resolve(process.cwd())
const distDir = resolve(rootDir, 'dist')
const publicDir = resolve(rootDir, 'public')
const backendTarget = new URL('http://localhost:8080')
const port = Number(process.env.PORT || 5173)

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
}

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, headers)
  res.end(body)
}

function safeResolve(baseDir, requestPath) {
  const resolved = normalize(join(baseDir, requestPath))
  return resolved.startsWith(baseDir) ? resolved : null
}

function serveFile(res, filePath) {
  const type = mimeTypes[extname(filePath).toLowerCase()] || 'application/octet-stream'
  const stat = statSync(filePath)
  res.writeHead(200, {
    'Content-Length': stat.size,
    'Content-Type': type,
  })
  createReadStream(filePath).pipe(res)
}

function proxyRequest(req, res) {
  const targetUrl = new URL(req.url, backendTarget)
  const headers = { ...req.headers, host: targetUrl.host }
  delete headers['content-length']
  delete headers['connection']

  const proxy = httpRequest(
    {
      hostname: targetUrl.hostname,
      port: targetUrl.port,
      path: `${targetUrl.pathname}${targetUrl.search}`,
      method: req.method,
      headers,
    },
    (upstream) => {
      res.writeHead(upstream.statusCode || 502, upstream.headers)
      upstream.pipe(res)
    }
  )
  proxy.on('error', (error) => {
    send(res, 502, `Proxy error: ${error.message}\n`, { 'Content-Type': 'text/plain; charset=utf-8' })
  })

  req.pipe(proxy)
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')
  const pathname = decodeURIComponent(url.pathname)

  if (pathname === '/api' || pathname.startsWith('/api/')) {
    void proxyRequest(req, res)
    return
  }

  if (pathname === '/vite.svg') {
    send(
      res,
      200,
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" role="img" aria-label="Vite"><defs><linearGradient id="a" x1="-.18" x2=".7" y1=".45" y2=".75"><stop offset="0" stop-color="#41d1ff"/><stop offset="1" stop-color="#bd34fe"/></linearGradient><linearGradient id="b" x1=".08" x2=".5" y1=".38" y2=".88"><stop offset="0" stop-color="#ffe484"/><stop offset="1" stop-color="#ffd43b"/></linearGradient></defs><path fill="url(#a)" d="M255.9 41.4 134.7 243.8c-2.6 4.4-9 4.4-11.6 0L.1 41.4c-2.8-4.8 1.3-10.7 6.8-9.9l121 17.7c1.6.2 3.2.2 4.8 0l116.4-17.7c5.5-.8 9.6 5.1 6.8 9.9Z"/><path fill="url(#b)" d="M188.2 0 96 17.2l8.1 95.7 28.9 5.4 28.8-5.4L188.2 0Z"/><path fill="#fff" d="m96 17.2 28.5 88.4 28.5-88.4L96 17.2Z"/></svg>`,
      { 'Content-Type': 'image/svg+xml; charset=utf-8' }
    )
    return
  }

  const requestPath = pathname === '/' ? '/index.html' : pathname
  const candidatePaths = [
    safeResolve(distDir, requestPath),
    safeResolve(publicDir, requestPath),
    safeResolve(rootDir, requestPath),
  ].filter(Boolean)

  for (const filePath of candidatePaths) {
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      serveFile(res, filePath)
      return
    }
  }

  const fallback = join(distDir, 'index.html')
  if (existsSync(fallback)) {
    serveFile(res, fallback)
    return
  }

  send(res, 404, 'Not found\n', { 'Content-Type': 'text/plain; charset=utf-8' })
}).listen(port, () => {
  console.log(`Static frontend server running at http://localhost:${port}`)
  console.log(`Proxying /api -> ${backendTarget.origin}`)
})
