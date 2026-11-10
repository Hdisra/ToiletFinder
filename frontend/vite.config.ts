import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'

/**
 * Adds a Content-Security-Policy to the built index.html: the browser then only
 * loads scripts from this app and only talks to the API, the map tiles and the
 * place search. It limits the damage if an injected script ever ran (the login
 * token is kept in localStorage). Not applied in dev: hot reload needs inline scripts.
 * `frame-ancestors` can't be set from HTML; set it as a header in the hosting (see README).
 */
function contentSecurityPolicy(apiUrl: string): Plugin {
  const policy = [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self' 'unsafe-inline'", // the map library and the charts set inline styles
    "img-src 'self' data: https://tile.openstreetmap.org",
    `connect-src 'self' ${new URL(apiUrl).origin} https://nominatim.openstreetmap.org`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')

  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml: () => [
      {
        tag: 'meta',
        attrs: { 'http-equiv': 'Content-Security-Policy', content: policy },
        injectTo: 'head-prepend',
      },
    ],
  }
}

export default defineConfig(({ mode }) => {
  const { VITE_API_URL } = loadEnv(mode, process.cwd(), 'VITE_')

  return {
    plugins: [
      react(),
      tailwindcss(),
      contentSecurityPolicy(VITE_API_URL || 'http://localhost:3000/api'),
    ],
    resolve: { tsconfigPaths: true },
  }
})
