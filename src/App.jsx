import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { Loader2 } from 'lucide-react';

// ── Carga diferida (code splitting) ──
// Cada vista se descarga SOLO cuando el usuario navega a ella,
// reduciendo drásticamente el bundle inicial y el tiempo de arranque.
const Home = lazy(() => import('./pages/Home'));
const Clients = lazy(() => import('./pages/Clients'));
const NewClient = lazy(() => import('./pages/NewClient'));
const ClientDetail = lazy(() => import('./pages/ClientDetail'));
const Projects = lazy(() => import('./pages/Projects'));
const NewProject = lazy(() => import('./pages/NewProject'));
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const Essays = lazy(() => import('./pages/Essays'));
const NewEssay = lazy(() => import('./pages/NewEssay'));
const EssayCompare = lazy(() => import('./pages/EssayCompare'));
const EssayDetail = lazy(() => import('./pages/EssayDetail'));
const IngredientList = lazy(() => import('./pages/IngredientList'));
const NewIngredient = lazy(() => import('./pages/NewIngredient'));
const IngredientDetail = lazy(() => import('./pages/IngredientDetail'));
const VisitList = lazy(() => import('./pages/VisitList'));
const NewVisit = lazy(() => import('./pages/NewVisit'));
const VisitDetail = lazy(() => import('./pages/VisitDetail'));
const Settings = lazy(() => import('./pages/Settings'));

// Fallback mínimo mientras se carga el chunk de la vista
function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[400px]" style={{ color: 'var(--text-2)' }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent)' }} />
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
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
                        <Route path="/settings" element={<Settings />} />
                    </Routes>
                </Suspense>
            </Layout>
        </BrowserRouter>
    );
}
