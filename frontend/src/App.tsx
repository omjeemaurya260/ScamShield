import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MessageScanner from './pages/MessageScanner';
import ScreenshotScanner from './pages/ScreenshotScanner';
import CallAnalyzer from './pages/CallAnalyzer';
import LinkChecker from './pages/LinkChecker';
import FamilyProtection from './pages/FamilyProtection';
import ScanHistory from './pages/ScanHistory';
import SafetyEducation from './pages/SafetyEducation';

function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-cyan-400">404</p>
      <h1 className="mt-3 text-3xl font-bold text-white">Page not found</h1>
      <p className="mt-3 max-w-md text-slate-400">
        The ScamShield page you requested does not exist.
      </p>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen bg-[#0a0f1e] text-slate-100">
        <Routes>
          {/* Landing page without navbar */}
          <Route path="/" element={<LandingPage />} />

          {/* App pages with navbar */}
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <main className="pt-16 min-h-screen">
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/scanner" element={<MessageScanner />} />
                    <Route path="/screenshot" element={<ScreenshotScanner />} />
                    <Route path="/image-scanner" element={<ScreenshotScanner />} />
                    <Route path="/call" element={<CallAnalyzer />} />
                    <Route path="/audio-scanner" element={<CallAnalyzer />} />
                    <Route path="/url" element={<LinkChecker />} />
                    <Route path="/url-checker" element={<LinkChecker />} />
                    <Route path="/family" element={<FamilyProtection />} />
                    <Route path="/family-protection" element={<FamilyProtection />} />
                    <Route path="/history" element={<ScanHistory />} />
                    <Route path="/education" element={<SafetyEducation />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
