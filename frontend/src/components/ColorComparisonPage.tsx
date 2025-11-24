import React, { useState } from 'react';
import { VenuesPage } from './VenuesPage';
import { AccessPointsPage } from './AccessPointsPage';
import { WlansPage } from './WlansPage';

type Theme = 'current' | 'purple' | 'orange' | 'teal' | 'green';
type PageView = 'venues' | 'aps' | 'wlans';

interface ThemeInfo {
  name: string;
  description: string;
  primaryColor: string;
}

const themes: Record<Theme, ThemeInfo> = {
  current: {
    name: 'Professional Blue',
    description: 'Current Tailwind default palette',
    primaryColor: '#2563eb'
  },
  purple: {
    name: 'Modern Purple',
    description: 'Tech/SaaS aesthetic (Stripe, Linear inspired)',
    primaryColor: '#9333ea'
  },
  orange: {
    name: 'Warm Orange',
    description: 'Friendly, energetic (GitLab, Postman inspired)',
    primaryColor: '#ea580c'
  },
  teal: {
    name: 'Cool Teal',
    description: 'Professional, calming (Tailwind UI inspired)',
    primaryColor: '#0d9488'
  },
  green: {
    name: 'Forest Green',
    description: 'Natural, trustworthy (Notion inspired)',
    primaryColor: '#16a34a'
  }
};

export const ColorComparisonPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<Theme>('current');
  const [pageView, setPageView] = useState<PageView>('venues');

  return (
    <div className={`theme-${selectedTheme}`}>
      {/* Color Comparison Header */}
      <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Color Scheme Comparison
            </h1>
            <p className="text-gray-600">
              Compare different color palettes applied to your actual application pages with real data
            </p>
          </div>
        </div>

        {/* Theme Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color Scheme
            </label>
            <select
              value={selectedTheme}
              onChange={(e) => setSelectedTheme(e.target.value as Theme)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              {Object.entries(themes).map(([key, info]) => (
                <option key={key} value={key}>
                  {info.name} - {info.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Page to View
            </label>
            <select
              value={pageView}
              onChange={(e) => setPageView(e.target.value as PageView)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="venues">Venues Page</option>
              <option value="aps">Access Points Page</option>
              <option value="wlans">WiFi Networks Page</option>
            </select>
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-lg shadow-small border border-gray-200"
              style={{ background: themes[selectedTheme].primaryColor }}
            />
            <div>
              <div className="font-semibold text-gray-900">
                {themes[selectedTheme].name}
              </div>
              <div className="text-sm text-gray-600">
                {themes[selectedTheme].description}
              </div>
              <div className="text-xs text-gray-500 font-mono mt-1">
                Primary: {themes[selectedTheme].primaryColor}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Preview - Button Samples */}
        <div className="mt-6">
          <div className="text-sm font-medium text-gray-700 mb-3">Button Preview</div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-primary">Primary Button</button>
            <button className="btn-secondary">Secondary Button</button>
            <button className="btn-success">Success Button</button>
            <button className="btn-danger">Danger Button</button>
            <button className="btn-warning">Warning Button</button>
          </div>
        </div>

        {/* Badge Preview */}
        <div className="mt-4">
          <div className="text-sm font-medium text-gray-700 mb-3">Badge Preview</div>
          <div className="flex flex-wrap gap-2">
            <span className="badge badge-success">Success</span>
            <span className="badge badge-error">Error</span>
            <span className="badge badge-warning">Warning</span>
            <span className="badge badge-info">Info</span>
            <span className="badge badge-neutral">Neutral</span>
          </div>
        </div>
      </div>

      {/* Page Content with Applied Theme */}
      <div className="bg-white rounded-lg shadow-medium border border-gray-200 p-6">
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Live Page Preview
            <span className="ml-3 text-sm font-normal text-gray-600">
              ({pageView === 'venues' ? 'Venues' : pageView === 'aps' ? 'Access Points' : 'WiFi Networks'} with real data)
            </span>
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            This is the actual {pageView === 'venues' ? 'Venues' : pageView === 'aps' ? 'Access Points' : 'WiFi Networks'} page component fetching real data from your backend, styled with the selected color scheme.
          </p>
        </div>

        {/* Render the selected page */}
        {pageView === 'venues' && <VenuesPage />}
        {pageView === 'aps' && <AccessPointsPage />}
        {pageView === 'wlans' && <WlansPage />}
      </div>

      {/* Color Palette Reference */}
      <div className="mt-6 bg-white rounded-lg shadow-small border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Color Palette Reference</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {/* Primary Colors */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Primary</div>
            <div className="space-y-2">
              <div
                className="h-12 rounded border border-gray-200 shadow-small"
                style={{ background: themes[selectedTheme].primaryColor }}
              />
              <div className="text-xs font-mono text-gray-600">
                {themes[selectedTheme].primaryColor}
              </div>
            </div>
          </div>

          {/* Success Colors */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Success</div>
            <div className="space-y-2">
              <div
                className="h-12 rounded border border-gray-200 shadow-small bg-green-600"
              />
              <div className="text-xs font-mono text-gray-600">
                {selectedTheme === 'current' || selectedTheme === 'orange' ? '#16a34a' : '#059669'}
              </div>
            </div>
          </div>

          {/* Error Colors */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Error</div>
            <div className="space-y-2">
              <div
                className="h-12 rounded border border-gray-200 shadow-small bg-red-600"
              />
              <div className="text-xs font-mono text-gray-600">
                #dc2626
              </div>
            </div>
          </div>

          {/* Warning Colors */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Warning</div>
            <div className="space-y-2">
              <div
                className="h-12 rounded border border-gray-200 shadow-small"
                style={{ background: selectedTheme === 'teal' ? '#d97706' : '#ca8a04' }}
              />
              <div className="text-xs font-mono text-gray-600">
                {selectedTheme === 'teal' ? '#d97706' : '#ca8a04'}
              </div>
            </div>
          </div>

          {/* Neutral Colors */}
          <div>
            <div className="text-xs font-semibold text-gray-700 mb-2">Text</div>
            <div className="space-y-2">
              <div
                className="h-12 rounded border border-gray-200 shadow-small bg-gray-600"
              />
              <div className="text-xs font-mono text-gray-600">
                #4b5563
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <div className="font-semibold text-blue-900 mb-1">How to use this page</div>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select a color scheme from the dropdown to see how it affects all components</li>
              <li>• Switch between different pages to see the theme applied to various UI elements</li>
              <li>• All data is fetched from your real backend - this is not a mockup</li>
              <li>• This page is accessible at <code className="px-1 py-0.5 bg-blue-100 rounded font-mono text-xs">/color-demo</code> but not linked in the main navigation</li>
              <li>• Once you choose a theme, the CSS variables can be updated in <code className="px-1 py-0.5 bg-blue-100 rounded font-mono text-xs">index.css</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
