import './app.css';
import SimpleTest from './SimpleTest.svelte';

// Using Svelte 4 component API (which is enabled in vite.config.js)
const app = new SimpleTest({
  target: document.getElementById('app')
});

export default app; 