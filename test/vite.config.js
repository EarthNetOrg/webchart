import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [
    svelte({
      compilerOptions: {
        runes: true, // Enable Svelte 5 runes
        compatibility: {
          componentApi: 4 // Use Svelte 4's component API for compatibility (as a number, not a string)
        }
      },
      // Use Svelte 5's latest features
      onwarn: (warning, handler) => {
        // Ignore specific warnings
        if (warning.code.startsWith('a11y-')) return;
        handler(warning);
      }
    })
  ],
  root: 'test',
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  resolve: {
    dedupe: ['svelte']
  }
}); 