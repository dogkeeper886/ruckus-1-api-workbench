import React from 'react';
import { VenuesPage } from './components/VenuesPage';

function App() {
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
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <VenuesPage />
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
