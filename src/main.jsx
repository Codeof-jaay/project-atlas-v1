import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';


import './styles.css'; 

const container = document.getElementById('root');
const root = createRoot(container);

// Vercel Web Analytics (optional): load script only in production and when enabled
// Enable by setting VITE_VERCEL_ANALYTICS=true in your Vercel project/environment.
if (import.meta.env.PROD && import.meta.env.VITE_VERCEL_ANALYTICS === 'true') {
  try {
    const s = document.createElement('script');
    s.async = true;
    s.defer = true;
    // Vercel exposes analytics under the _vercel/insights path after enabling
    s.src = '/_vercel/insights/script.js';
    document.head.appendChild(s);
  } catch (e) {
    // ignore failures - analytics is optional
    // console.debug('Vercel analytics failed to load', e);
  }
}

root.render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);