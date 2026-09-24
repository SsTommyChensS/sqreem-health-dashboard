import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// Load .env for development server
dotenv.config();

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-chat-dev-middleware',
      configureServer(server) {
        server.middlewares.use('/api/chat', async (req, res) => {
          if (req.method === 'POST') {
            try {
              // Reload .env in case user just added their API key
              dotenv.config();

              // Read request body
              const buffers: Buffer[] = [];
              for await (const chunk of req) {
                buffers.push(chunk as Buffer);
              }
              const rawBody = Buffer.concat(buffers).toString('utf-8');
              const body = rawBody ? JSON.parse(rawBody) : {};

              // Dynamically load handler module
              const { handleChatRequest } = await server.ssrLoadModule('/api/chat.ts');
              const result = await handleChatRequest(body);

              res.setHeader('Content-Type', 'application/json');
              res.statusCode = result.status || 200;
              res.end(JSON.stringify(result.data));
            } catch (err: unknown) {
              const message = err instanceof Error ? err.message : 'Internal Server Error';
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = 500;
              res.end(JSON.stringify({ error: message }));
            }
          } else {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          }
        });
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'redux-vendor': ['@reduxjs/toolkit', 'react-redux'],
          'recharts-vendor': ['recharts'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
