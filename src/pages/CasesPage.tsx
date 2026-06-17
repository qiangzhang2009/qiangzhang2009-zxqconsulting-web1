import { lazy, Suspense } from 'react';

const CaseStudies = lazy(() => import('../sections/CaseStudies'));

export default function CasesPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <CaseStudies />
      </Suspense>
    </main>
  );
}
