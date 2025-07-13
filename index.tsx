import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import './index.css';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './src/styles/createEmotionCache';

const cacheRtl = createEmotionCache();

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <CacheProvider value={cacheRtl}>
        <App />
      </CacheProvider>
    </React.StrictMode>
  );
} else {
  console.error('Failed to find the root element');
}
