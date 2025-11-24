import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { VenuesPage } from './components/VenuesPage';
import { AccessPointsPage } from './components/AccessPointsPage';
import { WlansPage } from './components/WlansPage';
import { GuestPassesPage } from './components/GuestPassesPage';
import { ColorComparisonPage } from './components/ColorComparisonPage';

function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-b from-white to-gray-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                RUCKUS 1 API Workbench
              </h1>
              <p className="text-gray-600 mt-1">
                Network management and monitoring tool for RUCKUS One
              </p>
            </div>
            <div className="text-sm text-gray-500">
              <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex gap-4 mt-6 border-b border-gray-200">
            <Link
              to="/venues"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/venues'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Venues
            </Link>
            <Link
              to="/access-points"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/access-points'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Access Points
            </Link>
            <Link
              to="/wifi-networks"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/wifi-networks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              WiFi Networks
            </Link>
            <Link
              to="/guest-passes"
              className={`px-4 py-2 font-medium transition-colors ${
                location.pathname === '/guest-passes'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Guest Passes
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/venues" replace />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/access-points" element={<AccessPointsPage />} />
          <Route path="/wifi-networks" element={<WlansPage />} />
          <Route path="/guest-passes" element={<GuestPassesPage />} />
          <Route path="/color-demo" element={<ColorComparisonPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              RUCKUS 1 API Workbench v1.3.0
            </div>
            <div className="flex gap-4">
              <span>MCP Protocol</span>
              <span>•</span>
              <span>Real-time Monitoring</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
