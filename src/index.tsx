/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { CacheProvider } from '@emotion/react';
import { cacheRtl } from './config/theme';
import AppWrapper from './App';

// --- Render Application ---
const container = document.getElementById('root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <CacheProvider value={cacheRtl}>
            <AppWrapper />
        </CacheProvider>
      </React.StrictMode>
    );
}