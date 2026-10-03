import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // WSL does not see saves on the Windows drive unless polling is on.
      usePolling: process.platform === 'linux',
    },
  },
})
