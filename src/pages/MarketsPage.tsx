import { lazy, Suspense } from 'react';

const Markets = lazy(() => import('../sections/Markets'));

export default function MarketsPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <Markets />
      </Suspense>
    </main>
  );
}
