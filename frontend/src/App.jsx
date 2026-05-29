import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Clients from './pages/Clients';
import NewClient from './pages/NewClient';
import ClientDetail from './pages/ClientDetail';
import Projects from './pages/Projects';
import Essays from './pages/Essays';
import EssayDetail from './pages/EssayDetail';
import NewEssay from './pages/NewEssay';
import ProjectDetail from './pages/ProjectDetail';
import EssayCompare from './pages/EssayCompare';
import NewProject from './pages/NewProject';
import EditProject from './pages/EditProject';
import IngredientList from './pages/IngredientList';
import NewIngredient from './pages/NewIngredient';
import IngredientDetail from './pages/IngredientDetail';
import VisitList from './pages/VisitList';
import NewVisit from './pages/NewVisit';
import VisitDetail from './pages/VisitDetail';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
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
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
