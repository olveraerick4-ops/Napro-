import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const preview = process.env.PREVIEW === '1'

export default defineConfig({
  base: preview ? './' : '/',
  plugins: [
    react(),
    !preview && VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon.svg'],
      manifest: {
        name: 'Aurora — tu ciclo, naturalmente',
        short_name: 'Aurora',
        description: 'Registro del ciclo para métodos naturales: Creighton, Billings, sintotérmico, temperatura y calendario.',
        lang: 'es',
        theme_color: '#7b4a72',
        background_color: '#faf6f3',
        display: 'standalone',
        orientation: 'portrait',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }],
      },
    }),
  ],
})
