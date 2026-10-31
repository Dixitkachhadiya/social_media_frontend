import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Port 3000 matches the backend's FRONTEND_URL (CORS origin and email link base)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: { port: 3000, strictPort: true },
  preview: { port: 3000, strictPort: true },
});
