import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom';
import './i18n'
import './index.css'
import { router } from './routes';
import { Toaster } from 'sonner';
import { installGlobalErrorHandlers } from './lib/errorReporter';
import GA4 from './components/GA4';
import SEO from './components/SEO';
import FloatingContact from './components/FloatingContact';
import { MarketProvider } from './sections/aiTools/marketContext';

installGlobalErrorHandlers();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MarketProvider>
      <GA4 />
      <SEO />
      <RouterProvider router={router} />
      <Toaster position="top-right" />
      <FloatingContact />
    </MarketProvider>
  </StrictMode>,
);
// REVIEW_COMMENTS_MARKER
// CLOUDFLARE-DEPLOY-1782175447
// Trigger CF Pages build
