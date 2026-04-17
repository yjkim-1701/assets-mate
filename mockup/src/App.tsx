import { Provider } from '@react-spectrum/s2';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import BrandDashboard from './pages/BrandDashboard';
import AIFixInbox from './pages/AIFixInbox';
import AIFixApproval from './pages/AIFixApproval';
import AICreativeStudio from './pages/AICreativeStudio';
import Collaboration from './pages/Collaboration';
import SocialResize from './pages/SocialResize';
import Optimization from './pages/Optimization';
import TemplateLocks from './pages/TemplateLocks';
import ForbiddenAssets from './pages/ForbiddenAssets';
import BrandCustomModel from './pages/BrandCustomModel';
import BrandVariations from './pages/BrandVariations';

function App() {
  return (
    <Provider background="base" locale="ko-KR">
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/search" element={<Search />} />
            <Route path="/brand" element={<BrandDashboard />} />
            <Route path="/brand/template-locks" element={<TemplateLocks />} />
            <Route path="/brand/forbidden" element={<ForbiddenAssets />} />
            <Route path="/ai/inbox" element={<AIFixInbox />} />
            <Route path="/ai/inbox/:fixId" element={<AIFixApproval />} />
            <Route path="/ai/studio/:assetId" element={<AICreativeStudio />} />
            <Route path="/ai/studio" element={<AICreativeStudio />} />
            <Route path="/ai/brand-fix/:assetId" element={<AICreativeStudio />} />
            <Route path="/ai/variations/:assetId" element={<BrandVariations />} />
            <Route path="/ai/custom-models" element={<BrandCustomModel />} />
            <Route path="/ai" element={<AIFixInbox />} />
            <Route path="/collaboration" element={<Collaboration />} />
            <Route path="/social/resize" element={<SocialResize />} />
            <Route path="/social" element={<SocialResize />} />
            <Route path="/optimize" element={<Optimization />} />
            <Route path="/assets/:assetId" element={<Search />} />
            <Route path="/settings" element={<Dashboard />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
