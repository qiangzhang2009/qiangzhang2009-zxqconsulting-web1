import { lazy, Suspense } from 'react';

const Contact = lazy(() => import('../sections/Contact'));

export default function ExpertPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <Contact />
      </Suspense>
    </main>
  );
}
