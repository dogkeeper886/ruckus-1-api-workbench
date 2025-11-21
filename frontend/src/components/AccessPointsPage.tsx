import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { AccessPoint, BulkApRemoveRequest } from '../../../shared/types';
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
        setDeleteSessionId(response.data.sessionId);
        setShowDeleteDialog(false);
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

  const handleDeleteComplete = () => {
    setDeleteSessionId(null);
    setSelectedApSerials(new Set());
    fetchAps();
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleAddComplete = () => {
    setShowAddForm(false);
    fetchAps();
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

  // Show progress if delete session is active
  if (deleteSessionId) {
    return (
      <div>
        <button
          onClick={() => setDeleteSessionId(null)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to Access Points
        </button>
        <OperationProgress sessionId={deleteSessionId} onComplete={handleDeleteComplete} />
      </div>
    );
  }

  // Show add form
  if (showAddForm) {
    return (
      <div>
        <button
          onClick={() => setShowAddForm(false)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to Access Points
        </button>
        <BulkApForm onComplete={handleAddComplete} />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Access Points</h2>
          <p className="text-sm text-gray-600 mt-1">
            Last updated: {formatTimestamp(lastRefresh)}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleDeleteClick}
            disabled={selectedApSerials.size === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Delete Selected ({selectedApSerials.size})
          </button>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add APs
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
          <button onClick={() => setError(null)} className="ml-4 underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading access points...</p>
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApSerials.size === aps.length && aps.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aps.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        No access points found. Click "Add APs" to get started.
                      </td>
                    </tr>
                  ) : (
                    aps.map((ap) => (
                      <tr key={ap.serialNumber} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedApSerials.has(ap.serialNumber)}
                            onChange={() => handleSelectAp(ap.serialNumber)}
                            className="rounded border-gray-300"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {ap.serialNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {ap.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {ap.venueName || ap.venueId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {ap.apGroupName || ap.apGroupId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(ap.status)}`}>
                            {ap.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {ap.model || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {aps.length} access point{aps.length !== 1 ? 's' : ''}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Access Points</h3>
            
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

            <p className="text-gray-600 mb-4">
              Are you sure you want to delete <strong>{selectedApSerials.size}</strong> access point{selectedApSerials.size !== 1 ? 's' : ''}?
              This action cannot be undone.
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
                  className="w-full px-3 py-2 border rounded-md"
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
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50"
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
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

