import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AccessPoint, BulkApRemoveRequest } from '../../../shared/types';
import { ApiLogsPanel } from './ApiLogsPanel';
import { OperationProgress } from './OperationProgress';
import { BulkApForm } from './BulkApForm';

export const AccessPointsPage: React.FC = () => {
  const [aps, setAps] = useState<AccessPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection state
  const [selectedApSerials, setSelectedApSerials] = useState<Set<string>>(new Set());

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteMaxConcurrent, setDeleteMaxConcurrent] = useState(5);
  const [deleteDelayMs, setDeleteDelayMs] = useState(500);
  const [deleteWaitMode, setDeleteWaitMode] = useState<'track' | 'fire'>('track');
  const [isDeleting, setIsDeleting] = useState(false);

  // Session tracking for progress
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchAps = async () => {
    try {
      setError(null);
      const apsData = await apiService.getAps();
      setAps(apsData.data || []);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching APs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch APs');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAps();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAps, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAps();
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
    if (selectedApSerials.size === aps.length) {
      setSelectedApSerials(new Set());
    } else {
      setSelectedApSerials(new Set(aps.map(ap => ap.serialNumber)));
    }
  };

  const handleSelectAp = (serialNumber: string) => {
    const newSelection = new Set(selectedApSerials);
    if (newSelection.has(serialNumber)) {
      newSelection.delete(serialNumber);
    } else {
      newSelection.add(serialNumber);
    }
    setSelectedApSerials(newSelection);
  };

  const handleDeleteClick = () => {
    if (selectedApSerials.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    // Check if all selected APs are from the same venue
    const selectedAps = aps.filter(ap => selectedApSerials.has(ap.serialNumber));
    const venues = new Set(selectedAps.map(ap => ap.venueId));

    if (venues.size > 1) {
      setError('All selected APs must be from the same venue');
      setShowDeleteDialog(false);
      return;
    }

    if (venues.size === 0) {
      setError('No APs selected');
      setShowDeleteDialog(false);
      return;
    }

    const venueId = Array.from(venues)[0];

    setIsDeleting(true);
    try {
      const request: BulkApRemoveRequest = {
        apSerialNumbers: Array.from(selectedApSerials),
        venueId,
        options: {
          maxConcurrent: deleteMaxConcurrent,
          delayMs: deleteDelayMs
        }
      };

      const response = await apiService.bulkRemoveAps(request);

      if (response.success && response.data) {
        if (deleteWaitMode === 'track') {
          // Switch to progress tracking view
          setDeleteSessionId(response.data.sessionId);
          setShowDeleteDialog(false);
        } else {
          // Fire and forget mode
          setShowDeleteDialog(false);
          setSelectedApSerials(new Set());
          // Refresh AP list after a short delay
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start delete operation');
      }
    } catch (err: any) {
      console.error('Error deleting APs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to delete APs');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressComplete = () => {
    // When progress tracking is complete, return to AP list
    setDeleteSessionId(null);
    setSelectedApSerials(new Set());
    handleRefresh();
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleAddComplete = () => {
    setShowAddForm(false);
    handleRefresh();
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('online') || statusLower.includes('connected')) {
      return 'bg-green-100 text-green-800';
    } else if (statusLower.includes('offline') || statusLower.includes('disconnected')) {
      return 'bg-red-100 text-red-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
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
            ← Back to Access Points
          </button>
        </div>
        <OperationProgress sessionId={deleteSessionId} />
      </div>
    );
  }

  // If showing add form
  if (showAddForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
          <button
            onClick={() => setShowAddForm(false)}
            className="btn-secondary"
          >
            ← Back to Access Points
          </button>
        </div>
        <BulkApForm onComplete={handleAddComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Access Points</h2>
            <p className="text-sm text-gray-600 mt-1">
              View all access points from RUCKUS One
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
              <h3 className="text-red-800 font-semibold">Error Loading Access Points</h3>
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
            <p className="text-gray-600">Loading access points...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-large p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Access Points</h3>

            {/* Check for venue mismatch */}
            {(() => {
              const selectedAps = aps.filter(ap => selectedApSerials.has(ap.serialNumber));
              const venues = new Set(selectedAps.map(ap => ap.venueId));
              if (venues.size > 1) {
                return (
                  <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> All selected APs must be from the same venue.
                    Please select APs from only one venue.
                  </div>
                );
              }
              return null;
            })()}

            <p className="text-gray-700 mb-6">
              You are about to delete <span className="font-bold text-red-600">{selectedApSerials.size}</span> access point(s). This action cannot be undone.
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
                disabled={isDeleting || (() => {
                  const selectedAps = aps.filter(ap => selectedApSerials.has(ap.serialNumber));
                  const venues = new Set(selectedAps.map(ap => ap.venueId));
                  return venues.size > 1;
                })()}
                className="flex-1 btn-danger"
              >
                {isDeleting ? 'Starting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Access Points Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-small border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                All Access Points ({aps.length})
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={handleAddClick}
                  disabled={selectedApSerials.size > 0}
                  className="btn-success flex items-center gap-2"
                >
                  <span>➕</span>
                  Add APs
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={selectedApSerials.size === 0}
                  className="btn-danger flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete Selected {selectedApSerials.size > 0 && `(${selectedApSerials.size})`}
                </button>
              </div>
            </div>
          </div>

          {aps.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📡</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Access Points Found</h3>
              <p className="text-gray-600">
                No access points are currently configured. Click "Add APs" to get started.
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
                        checked={selectedApSerials.size === aps.length && aps.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Serial Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Venue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      AP Group
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aps.map((ap) => (
                    <tr
                      key={ap.serialNumber}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedApSerials.has(ap.serialNumber)}
                          onChange={() => handleSelectAp(ap.serialNumber)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {ap.serialNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {ap.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {ap.venueName || ap.venueId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {ap.apGroupName || ap.apGroupId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadge(ap.status)}`}>
                          {ap.status}
                        </span>
                      </td>
                    </tr>
                    ))
                  }
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

