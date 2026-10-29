import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { LanguageProvider } from './context/LanguageContext';
import './index.css';

// --- GLOBAL CRISP HAPTIC FEEDBACK ---
(function initGlobalHaptics() {
  // Check if browser/device supports vibration
  if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;

  // Har click ya touch par crisp 12ms ka vibration
  document.addEventListener(
    'pointerdown',
    (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target || typeof target.closest !== 'function') return;

      // Check karein agar click kisi button, link, input ya interactive card par hua hai
      const interactiveTarget = target.closest(
        'button, a, input, select, textarea, .tab, .chip, [role="button"], .card'
      );

      if (interactiveTarget) {
        try {
          navigator.vibrate(12); // 12ms = subtle, premium haptic click
        } catch {
          // Silently ignore if blocked by browser policy
        }
      }
    },
    { passive: true }
  );
})();

createRoot(document.getElementById('root')!).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>
);

