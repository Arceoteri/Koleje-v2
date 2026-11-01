import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker for offline playability and PWA installation
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Nowa wersja gry jest dostępna.');
  },
  onOfflineReady() {
    console.log('Gra Tory Kolejowe jest w pełni gotowa do gry offline.');
  },
});


createRoot(document.getElementById('root')!).render(<App />);
