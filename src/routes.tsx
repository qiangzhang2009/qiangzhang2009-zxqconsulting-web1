import { createBrowserRouter } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import CasesPage from './pages/CasesPage';
import ExpertPage from './pages/ExpertPage';
import MethodPage from './pages/MethodPage';
import MarketsPage from './pages/MarketsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'diagnose', element: <DiagnosisPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'expert', element: <ExpertPage /> },
      { path: 'method', element: <MethodPage /> },
      { path: 'markets', element: <MarketsPage /> },
    ],
  },
  {
    path: '*',
    element: <Layout />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);
