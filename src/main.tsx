import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline playability and PWA installation in production
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  try {
    if (import.meta.env.PROD) {
      registerSW({ immediate: true });
    }
  } catch (err) {
    console.warn('PWA registration skipped:', err);
  }
}

createRoot(document.getElementById('root')!).render(<App />);
