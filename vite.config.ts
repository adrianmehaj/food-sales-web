import { defineConfig } from 'vite';
import type { Plugin, ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';

const publicHost = 'agreeing-shuffling-shield.ngrok-free.dev';
const backend = 'http://localhost:5080';

function backendProxy(): ProxyOptions {
  return {
    target: backend,
    changeOrigin: true,
    configure(proxy) {
      proxy.on('proxyReq', (outgoing, request) => {
        // Only the explicitly allowed tunnel host represents an HTTPS origin.
        // Replace incoming values rather than trusting client-supplied headers.
        const host = request.headers.host?.toLowerCase().replace(/:\d+$/, '');
        outgoing.setHeader('X-Forwarded-Proto', host === publicHost ? 'https' : 'http');
      });
    },
  };
}

function localSwaggerOnly(): Plugin {
  return {
    name: 'local-swagger-only',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
        if (/^\/swagger(?:\/|$)/i.test(pathname)) {
          response.statusCode = 404;
          response.setHeader('Cache-Control', 'no-store');
          response.end('Not Found');
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), localSwaggerOnly()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    allowedHosts: [publicHost],
    proxy: {
      '/api': backendProxy(),
      '/media': backendProxy(),
      '/health': backendProxy(),
    },
  },
  build: { target: ['es2020', 'safari15'] },
});
