import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { BulkVenueForm } from './components/BulkVenueForm';
import { BulkWlanForm } from './components/BulkWlanForm';
import { BulkApForm } from './components/BulkApForm';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              RUCKUS 1 API Workbench
            </h1>
            <p className="text-gray-600 mt-1">Bulk operations tool for RUCKUS One</p>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex space-x-8">
              <Link
                to="/"
                className="py-4 px-3 border-b-2 border-transparent hover:border-blue-500 text-gray-700 hover:text-blue-600"
              >
                Venues
              </Link>
              <Link
                to="/wlans"
                className="py-4 px-3 border-b-2 border-transparent hover:border-blue-500 text-gray-700 hover:text-blue-600"
              >
                WLANs
              </Link>
              <Link
                to="/aps"
                className="py-4 px-3 border-b-2 border-transparent hover:border-blue-500 text-gray-700 hover:text-blue-600"
              >
                Access Points
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<BulkVenueForm />} />
            <Route path="/wlans" element={<BulkWlanForm />} />
            <Route path="/aps" element={<BulkApForm />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
            RUCKUS 1 API Workbench - Bulk operations tool for RUCKUS One network management
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
