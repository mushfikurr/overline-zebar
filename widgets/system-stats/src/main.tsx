import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import '@overline-zebar/ui/theme.css';
import '@overline-zebar/ui/index.css';
import '@overline-zebar/ui/fonts.css';
import App from './App';
import { ConfigProvider } from '@overline-zebar/config';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

createRoot(rootElement).render(
  <StrictMode>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </StrictMode>
);
