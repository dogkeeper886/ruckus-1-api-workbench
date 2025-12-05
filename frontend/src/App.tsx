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
          
          {/* Tab Navigation - Light pill style */}
          <div className="flex gap-1 mt-6 p-1 bg-gray-100/80 rounded-lg w-fit border border-gray-200/50">
            <Link
              to="/venues"
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 ${
                location.pathname === '/venues'
                  ? 'bg-white text-blue-600 shadow-small'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              Venues
            </Link>
            <Link
              to="/access-points"
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 ${
                location.pathname === '/access-points'
                  ? 'bg-white text-blue-600 shadow-small'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              Access Points
            </Link>
            <Link
              to="/wifi-networks"
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 ${
                location.pathname === '/wifi-networks'
                  ? 'bg-white text-blue-600 shadow-small'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
              }`}
            >
              WiFi Networks
            </Link>
            <Link
              to="/guest-passes"
              className={`px-4 py-2 font-medium rounded-md transition-all duration-200 ${
                location.pathname === '/guest-passes'
                  ? 'bg-white text-blue-600 shadow-small'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/60'
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
