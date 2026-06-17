import { lazy, Suspense } from 'react';
import { MarketProvider } from '../sections/aiTools/marketContext';

const AIToolsHub = lazy(() => import('../sections/AIToolsHub'));

export default function DiagnosisPage() {
  return (
    <MarketProvider>
      <main>
        <Suspense fallback={null}>
          <AIToolsHub />
        </Suspense>
      </main>
    </MarketProvider>
  );
}
