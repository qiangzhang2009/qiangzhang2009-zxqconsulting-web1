import { lazy, Suspense } from 'react';
import Hero from '../sections/Hero';

const About = lazy(() => import('../sections/About'));
const Services = lazy(() => import('../sections/Services'));
const CaseStudies = lazy(() => import('../sections/CaseStudies'));

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Suspense fallback={null}>
        <About />
        <Services />
        <CaseStudies />
      </Suspense>
    </main>
  );
}
