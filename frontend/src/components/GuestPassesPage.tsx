import React, { useEffect, useState, useCallback } from 'react';
import { apiService } from '../services/api';
import { GuestPass, BulkGuestPassDeleteRequest } from '../../../shared/types';
import { ApiLogsPanel } from './ApiLogsPanel';
import { OperationProgress } from './OperationProgress';
import { BulkGuestPassForm } from './BulkGuestPassForm';

export const GuestPassesPage: React.FC = () => {
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection state
  const [selectedGuestPassIds, setSelectedGuestPassIds] = useState<Set<string>>(new Set());

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

  const fetchGuestPasses = useCallback(async () => {
    try {
      setError(null);
      const guestPassData = await apiService.getGuestPasses();
      setGuestPasses(guestPassData);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching guest passes:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch guest passes');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Fetch guest passes on mount
  useEffect(() => {
    fetchGuestPasses();
  }, [fetchGuestPasses]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchGuestPasses, 30000);
    return () => clearInterval(interval);
  }, [fetchGuestPasses]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchGuestPasses();
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedGuestPassIds.size === guestPasses.length) {
      setSelectedGuestPassIds(new Set());
    } else {
      setSelectedGuestPassIds(new Set(guestPasses.map(gp => gp.id)));
    }
  };

  const handleSelectGuestPass = (guestPassId: string) => {
    const newSelection = new Set(selectedGuestPassIds);
    if (newSelection.has(guestPassId)) {
      newSelection.delete(guestPassId);
    } else {
      newSelection.add(guestPassId);
    }
    setSelectedGuestPassIds(newSelection);
  };

  const handleDeleteClick = () => {
    if (selectedGuestPassIds.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      // Get networkId from the first selected guest pass
      const firstSelectedId = Array.from(selectedGuestPassIds)[0];
      const firstSelectedGuestPass = guestPasses.find(gp => gp.id === firstSelectedId);

      if (!firstSelectedGuestPass) {
        setError('Unable to determine network for selected guest passes');
        setIsDeleting(false);
        return;
      }

      const request: BulkGuestPassDeleteRequest = {
        networkId: firstSelectedGuestPass.networkId,
        guestPassIds: Array.from(selectedGuestPassIds),
        options: {
          maxConcurrent: deleteMaxConcurrent,
          delayMs: deleteDelayMs
        }
      };

      const response = await apiService.bulkDeleteGuestPasses(request);

      if (response.success && response.data) {
        if (deleteWaitMode === 'track') {
          setDeleteSessionId(response.data.sessionId);
          setShowDeleteDialog(false);
        } else {
          setShowDeleteDialog(false);
          setSelectedGuestPassIds(new Set());
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start delete operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete guest passes');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressComplete = () => {
    setDeleteSessionId(null);
    setSelectedGuestPassIds(new Set());
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
            ← Back to Guest Passes
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
            ← Back to Guest Passes
          </button>
        </div>
        <BulkGuestPassForm onComplete={handleCreateComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Guest Pass Credentials</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage guest pass credentials for WiFi networks
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg shadow-small p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Error Loading Guest Passes</h3>
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

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading guest passes...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-large p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Guest Passes</h3>
            <p className="text-gray-700 mb-6">
              You are about to delete <span className="font-bold text-red-600">{selectedGuestPassIds.size}</span> guest pass credential(s). This action cannot be undone.
            </p>

            <div className="space-y-4">
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
                  Delay Between Deletes (ms)
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

            <div className="mt-6 flex gap-3">
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
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Guest Passes Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-small border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                All Guest Passes ({guestPasses.length})
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={selectedGuestPassIds.size > 0}
                  className="btn-success flex items-center gap-2"
                >
                  <span>➕</span>
                  Create Guest Passes
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={selectedGuestPassIds.size === 0}
                  className="btn-danger flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Selected {selectedGuestPassIds.size > 0 && `(${selectedGuestPassIds.size})`}
                </button>
              </div>
            </div>
          </div>

          {guestPasses.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">🔑</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Guest Passes Found</h3>
              <p className="text-gray-600">
                No guest pass credentials exist for this network yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[50vh] md:max-h-[60vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={guestPasses.length > 0 && selectedGuestPassIds.size === guestPasses.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      WiFi Network
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guestPasses.map((gp) => (
                    <tr key={gp.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedGuestPassIds.has(gp.id)}
                          onChange={() => handleSelectGuestPass(gp.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {gp.networkName && gp.ssid ? `${gp.networkName} (${gp.ssid})` : gp.ssid || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {gp.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <ApiLogsPanel />
    </div>
  );
};
