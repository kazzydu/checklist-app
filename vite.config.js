import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import { readFileSync, writeFileSync } from 'fs'

function serviceWorkerPlugin() {
  return {
    name: 'replace-sw-env',
    closeBundle() {
      const env = loadEnv('production', process.cwd(), 'VITE_')
      const swPath = resolve(__dirname, 'dist/firebase-messaging-sw.js')
      let sw = readFileSync(swPath, 'utf-8')
      sw = sw.replace('__VITE_FIREBASE_API_KEY__', env.VITE_FIREBASE_API_KEY || '')
      sw = sw.replace('__VITE_FIREBASE_AUTH_DOMAIN__', env.VITE_FIREBASE_AUTH_DOMAIN || '')
      sw = sw.replace('__VITE_FIREBASE_PROJECT_ID__', env.VITE_FIREBASE_PROJECT_ID || '')
      sw = sw.replace('__VITE_FIREBASE_STORAGE_BUCKET__', env.VITE_FIREBASE_STORAGE_BUCKET || '')
      sw = sw.replace('__VITE_FIREBASE_MESSAGING_SENDER_ID__', env.VITE_FIREBASE_MESSAGING_SENDER_ID || '')
      sw = sw.replace('__VITE_FIREBASE_APP_ID__', env.VITE_FIREBASE_APP_ID || '')
      writeFileSync(swPath, sw)
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), serviceWorkerPlugin()],
})
