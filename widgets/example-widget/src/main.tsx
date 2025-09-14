import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ConfigProvider } from '@overline-zebar/config';
import '@overline-zebar/ui/theme.css';
import '@overline-zebar/ui/index.css';
import '@overline-zebar/ui/fonts.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </React.StrictMode>
);
