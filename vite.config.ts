import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

function injectPrecacheAssets() {
  return {
    name: 'inject-precache-assets',
    apply: 'build' as const,
    async closeBundle() {
      const assetsDirectory = join(process.cwd(), 'dist', 'assets')
      const serviceWorkerPath = join(process.cwd(), 'dist', 'sw.js')
      const assets = (await readdir(assetsDirectory)).map(
        (asset) => `/assets/${asset}`,
      )
      const serviceWorker = await readFile(serviceWorkerPath, 'utf8')
      const updatedServiceWorker = serviceWorker.replace(
        'const PRECACHE_ASSETS = []',
        `const PRECACHE_ASSETS = ${JSON.stringify(assets)}`,
      )
      await writeFile(serviceWorkerPath, updatedServiceWorker)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    injectPrecacheAssets(),
  ],
})
