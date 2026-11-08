import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawnSync } from 'node:child_process'

// Guarantees public/help-center exists for dev, preview AND build, however vite is launched (npm script, npx vite build, a .bat, a stale shell).
const helpCenter = () => ({
  name: 'raapnexus-help-center',
  config() {
    const r = spawnSync(process.execPath, ['scripts/install-help-center.mjs', '--if-missing'], { stdio: 'inherit' })
    if (r.status !== 0) throw new Error('Help Center content is missing: public/help-center could not be installed (see message above).')
  },
})

export default defineConfig({
  plugins: [helpCenter(), react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['framer-motion'],
          gsap: ['gsap'],
          three: ['three', '@react-three/fiber'],
        },
      },
    },
  },
})
