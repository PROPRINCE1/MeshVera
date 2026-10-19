import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Live mode: the client calls relative /api/v1/* URLs and Vite proxies them to
// the MeshVera backend at MESHVERA_API_URL (server-side only, never sent to the browser).
const target = process.env.MESHVERA_API_URL || 'http://localhost:3001'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
    proxy: { '/api': target },
  },
})
