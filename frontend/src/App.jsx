import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import Layout from './components/Layout';
import React, { Suspense, lazy, useEffect } from 'react';
import { API_URL } from './config';

const Home = lazy(() => import('./pages/Home'));
const Clients = lazy(() => import('./pages/Clients'));
const NewClient = lazy(() => import('./pages/NewClient'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const Essays = lazy(() => import('./pages/Essays'));
const EssayDetail = lazy(() => import('./pages/EssayDetail'));
const NewEssay = lazy(() => import('./pages/NewEssay'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const EssayCompare = lazy(() => import('./pages/EssayCompare'));
const NewProject = lazy(() => import('./pages/NewProject'));
const EditProject = lazy(() => import('./pages/EditProject'));
const IngredientList = lazy(() => import('./pages/IngredientList'));
const NewIngredient = lazy(() => import('./pages/NewIngredient'));
const IngredientDetail = lazy(() => import('./pages/IngredientDetail'));
const VisitList = lazy(() => import('./pages/VisitList'));
const NewVisit = lazy(() => import('./pages/NewVisit'));
const VisitDetail = lazy(() => import('./pages/VisitDetail'));
const Settings = lazy(() => import('./pages/Settings'));
const Finance = lazy(() => import('./pages/Finance'));

const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', color: 'var(--text-2)' }}>
    <div style={{ textAlign: 'center' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cargando...</p>
    </div>
  </div>
);

export default function App() {
  useEffect(() => {
    // Keep-alive ping every 4 minutes so Render backend never sleeps
    const ping = () => fetch(`${API_URL}/`).catch(() => {});
    ping();
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/clients/new" element={<NewClient />} />
              <Route path="/clients/:id" element={<ClientDetail />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/new" element={<NewProject />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/projects/:id/edit" element={<EditProject />} />
              <Route path="/essays" element={<Essays />} />
              <Route path="/essays/new" element={<NewEssay />} />
              <Route path="/essays/compare" element={<EssayCompare />} />
              <Route path="/essays/:id" element={<EssayDetail />} />
              <Route path="/ingredients" element={<IngredientList />} />
              <Route path="/ingredients/new" element={<NewIngredient />} />
              <Route path="/ingredients/:id" element={<IngredientDetail />} />
              <Route path="/visits" element={<VisitList />} />
              <Route path="/visits/new" element={<NewVisit />} />
              <Route path="/visits/:id" element={<VisitDetail />} />
              <Route path="/finanzas" element={<Finance />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </Suspense>
        </Layout>
      </ToastProvider>
    </BrowserRouter>
  );
}
