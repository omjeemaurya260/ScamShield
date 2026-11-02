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

const App: React.FC = () => {
  return (
    <Router>
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
                    <Route path="/call" element={<CallAnalyzer />} />
                    <Route path="/url" element={<LinkChecker />} />
                    <Route path="/family" element={<FamilyProtection />} />
                    <Route path="/history" element={<ScanHistory />} />
                    <Route path="/education" element={<SafetyEducation />} />
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
