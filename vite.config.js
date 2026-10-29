import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Relative base path so dist/ works both on static file:/// and any web server
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  preview: {
    host: '127.0.0.1',
    port: 4173
  }
});
