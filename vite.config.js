import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: true, // Listen on all addresses
    allowedHosts: [
      'cms.sponsrbridge.io',
      '.sponsrbridge.io' // This allows all subdomains
    ]
  }
})
