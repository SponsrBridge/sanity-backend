import { defineCliConfig } from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || '',
    dataset: 'production'
  },
  vite: {
    server: {
      host: true, // Listen on all network interfaces
      allowedHosts: [
        'cms.sponsrbridge.io',
        '.sponsrbridge.io', // Allows all subdomains
        'localhost',
        '127.0.0.1'
      ]
    }
  }
})
