# Create New Page

Interactive command to generate a new page component following the VenuesPage pattern.

---

## Instructions

I'll help you create a new page component that follows all design patterns and maintains consistency with existing pages.

**Before starting:**
- Review `/page-guidelines` if you haven't already
- Know your resource type (e.g., "Device", "Client", "Zone")
- Know your data structure

---

## Steps

### 1. Ask User for Details

Ask the user:
1. **Page Name** (e.g., "Devices", "Clients", "Zones")
2. **Resource Type** (singular, e.g., "Device", "Client", "Zone")
3. **Primary identifier field** (e.g., "id", "serialNumber", "macAddress")
4. **Display fields** for table (e.g., "name, status, location")
5. **Has bulk creation form?** (yes/no)

### 2. Generate Page Component

Using VenuesPage.tsx as a template:

**File:** `frontend/src/components/{ResourceType}sPage.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { {ResourceType}, Bulk{ResourceType}DeleteRequest } from '../../../shared/types';
import { ApiLogsPanel } from './ApiLogsPanel';
import { OperationProgress } from './OperationProgress';
import { Bulk{ResourceType}Form } from './Bulk{ResourceType}Form';

export const {ResourceType}sPage: React.FC = () => {
  // State (copy exact structure from VenuesPage)
  const [items, setItems] = useState<{ResourceType}[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMaxConcurrent, setDeleteMaxConcurrent] = useState(5);
  const [deleteDelayMs, setDeleteDelayMs] = useState(500);
  const [deleteWaitMode, setDeleteWaitMode] = useState<'track' | 'fire'>('track');
  const [isDeleting, setIsDeleting] = useState(false);

  // Session tracking for progress
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchItems = async () => {
    try {
      setError(null);
      const data = await apiService.get{ResourceType}s();
      setItems(data);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching {resource}s:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch {resource}s');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchItems();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchItems, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchItems();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Selection handlers (copy from VenuesPage)
  const handleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map(item => item.{primaryIdField})));
    }
  };

  const handleSelectItem = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
  };

  // Delete handlers (copy pattern from VenuesPage with inline comments)
  const handleDeleteClick = () => {
    if (selectedIds.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const request: Bulk{ResourceType}DeleteRequest = {
        {idFieldPlural}: Array.from(selectedIds),
        options: {
          maxConcurrent: deleteMaxConcurrent,
          delayMs: deleteDelayMs
        }
      };

      const response = await apiService.bulkDelete{ResourceType}s(request);

      if (response.success && response.data) {
        if (deleteWaitMode === 'track') {
          // Switch to progress tracking view
          setDeleteSessionId(response.data.sessionId);
          setShowDeleteDialog(false);
        } else {
          // Fire and forget mode
          setShowDeleteDialog(false);
          setSelectedIds(new Set());
          // Refresh list after a short delay
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start delete operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete {resource}s');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressComplete = () => {
    // When progress tracking is complete, return to {resource} list
    setDeleteSessionId(null);
    setSelectedIds(new Set());
    handleRefresh();
  };

  const handleCreateComplete = () => {
    setShowCreateForm(false);
    handleRefresh();
  };

  // If showing progress tracking view
  if (deleteSessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
          <button
            onClick={handleProgressComplete}
            className="btn-secondary"
          >
            ← Back to {ResourceType}s
          </button>
        </div>
        <OperationProgress sessionId={deleteSessionId} />
      </div>
    );
  }

  // If showing create form
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="btn-secondary"
          >
            ← Back to {ResourceType}s
          </button>
        </div>
        <Bulk{ResourceType}Form onComplete={handleCreateComplete} />
      </div>
    );
  }

  // Main view - copy structure from VenuesPage
  return (
    <div className="space-y-6">
      {/* Header - copy exact styling from VenuesPage */}
      <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{ResourceType}s</h2>
            <p className="text-sm text-gray-600 mt-1">
              View all {resource}s from RUCKUS One
              {lastRefresh && (
                <span className="ml-2">
                  • Last updated: {formatTimestamp(lastRefresh)}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="btn-primary flex items-center gap-2"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message - copy exact styling from VenuesPage */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-small p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Error Loading {ResourceType}s</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State - copy exact styling from VenuesPage */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading {resource}s...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog - copy exact styling from VenuesPage */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-large p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete {ResourceType}s</h3>
            <p className="text-gray-700 mb-6">
              You are about to delete <span className="font-bold text-red-600">{selectedIds.size}</span> {resource}(s). This action cannot be undone.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Concurrent (1-20)
                </label>
                <input
                  type="number"
                  value={deleteMaxConcurrent}
                  onChange={(e) => setDeleteMaxConcurrent(Number(e.target.value))}
                  min="1"
                  max="20"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay Between Ops (ms)
                </label>
                <input
                  type="number"
                  value={deleteDelayMs}
                  onChange={(e) => setDeleteDelayMs(Number(e.target.value))}
                  min="0"
                  max="10000"
                  step="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wait Mode
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="track"
                      checked={deleteWaitMode === 'track'}
                      onChange={(e) => setDeleteWaitMode(e.target.value as 'track' | 'fire')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Track Progress - Show detailed progress</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="fire"
                      checked={deleteWaitMode === 'fire'}
                      onChange={(e) => setDeleteWaitMode(e.target.value as 'track' | 'fire')}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Fire and Forget - Start and return immediately</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 btn-danger"
              >
                {isDeleting ? 'Starting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table - copy exact styling from VenuesPage */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-small border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                All {ResourceType}s ({items.length})
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={selectedIds.size > 0}
                  className="btn-success flex items-center gap-2"
                >
                  <span>➕</span>
                  Create {ResourceType}s
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={selectedIds.size === 0}
                  className="btn-danger flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Selected {selectedIds.size > 0 && `(${selectedIds.size})`}
                </button>
              </div>
            </div>
          </div>

          {items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No {ResourceType}s Found</h3>
              <p className="text-gray-600">
                No {resource}s are currently configured in your RUCKUS One account.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === items.length && items.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    {/* ADD TABLE HEADERS FOR DISPLAY FIELDS */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Column Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr
                      key={item.{primaryIdField}}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(item.{primaryIdField})}
                          onChange={() => handleSelectItem(item.{primaryIdField})}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      {/* ADD TABLE CELLS - MUST WRAP IN DIVS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.fieldName}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* API Logs Panel */}
      <ApiLogsPanel />
    </div>
  );
};
```

### 3. Verify Against Checklist

Run through `/page-guidelines` checklist to ensure all patterns are followed.

### 4. Next Steps

After generating the page component, you may need to:
1. Add types to `shared/types.ts`
2. Add API methods to `frontend/src/services/api.ts`
3. Add backend routes
4. Create bulk form component (if needed)
5. Add route to App.tsx

---

## Usage

Type `/new-page` and I'll guide you through creating a new page component step-by-step.
