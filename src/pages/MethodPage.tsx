import { lazy, Suspense } from 'react';

const About = lazy(() => import('../sections/About'));

export default function MethodPage() {
  return (
    <main>
      <Suspense fallback={null}>
        <About />
      </Suspense>
    </main>
  );
}
