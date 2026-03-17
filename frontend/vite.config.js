import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const backendPort = env.SHEMS_PORT || process.env.SHEMS_PORT || '8080'
  const backendTarget =
    env.SHEMS_BACKEND_URL ||
    env.VITE_BACKEND_URL ||
    `http://localhost:${backendPort}`

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
          timeout: 20000,
          proxyTimeout: 20000,
          configure: (proxy) => {
            proxy.on('error', (err, req) => {
              console.error('[vite-proxy] error:', err?.message, 'url:', req?.url)
            })
          },
        },
      },
    },
  }
})
