import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  plugins: [sveltekit()],
  server: {
    fs: {
      allow: [
        path.resolve('src'),
        path.resolve('.svelte-kit'),
        path.resolve('node_modules'),
        'D:/Project'
      ]
    }
  }
});