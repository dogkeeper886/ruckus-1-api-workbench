import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { WifiNetwork, BulkWlanDeleteRequest, Venue } from '../../../shared/types';
import { ApiLogsPanel } from './ApiLogsPanel';
import { OperationProgress } from './OperationProgress';
import { BulkWlanForm } from './BulkWlanForm';

export const WlansPage: React.FC = () => {
  const [wlans, setWlans] = useState<WifiNetwork[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Selection state
  const [selectedNetworkIds, setSelectedNetworkIds] = useState<Set<string>>(new Set());

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

  // Activate dialog state
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [selectedVenueIds, setSelectedVenueIds] = useState<Set<string>>(new Set());
  const [activateMaxConcurrent, setActivateMaxConcurrent] = useState(5);
  const [activateDelayMs, setActivateDelayMs] = useState(500);
  const [activateWaitMode, setActivateWaitMode] = useState<'track' | 'fire'>('track');
  const [isActivating, setIsActivating] = useState(false);
  const [activateSessionId, setActivateSessionId] = useState<string | null>(null);

  // Deactivate dialog state
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [deactivateVenueIds, setDeactivateVenueIds] = useState<Set<string>>(new Set());
  const [deactivateMaxConcurrent, setDeactivateMaxConcurrent] = useState(5);
  const [deactivateDelayMs, setDeactivateDelayMs] = useState(500);
  const [deactivateWaitMode, setDeactivateWaitMode] = useState<'track' | 'fire'>('track');
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateSessionId, setDeactivateSessionId] = useState<string | null>(null);

  const fetchWlans = async () => {
    try {
      setError(null);
      const wlansData = await apiService.getWlans();
      setWlans(wlansData);
      setLastRefresh(new Date());
    } catch (err: any) {
      console.error('Error fetching WLANs:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch WiFi networks');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchVenues = async () => {
    try {
      const venuesData = await apiService.getVenues();
      setVenues(venuesData);
    } catch (err: any) {
      console.error('Error fetching venues:', err);
    }
  };

  useEffect(() => {
    fetchWlans();
    fetchVenues();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchWlans, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchWlans();
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
    if (selectedNetworkIds.size === wlans.length) {
      setSelectedNetworkIds(new Set());
    } else {
      setSelectedNetworkIds(new Set(wlans.map(w => w.id)));
    }
  };

  const handleSelectNetwork = (networkId: string) => {
    const newSelection = new Set(selectedNetworkIds);
    if (newSelection.has(networkId)) {
      newSelection.delete(networkId);
    } else {
      newSelection.add(networkId);
    }
    setSelectedNetworkIds(newSelection);
  };

  const handleDeleteClick = () => {
    if (selectedNetworkIds.size > 0) {
      setShowDeleteDialog(true);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const request: BulkWlanDeleteRequest = {
        networkIds: Array.from(selectedNetworkIds),
        options: {
          maxConcurrent: deleteMaxConcurrent,
          delayMs: deleteDelayMs
        }
      };

      const response = await apiService.bulkDeleteWlans(request);

      if (response.success && response.data) {
        if (deleteWaitMode === 'track') {
          // Switch to progress tracking view
          setDeleteSessionId(response.data.sessionId);
          setShowDeleteDialog(false);
        } else {
          // Fire and forget mode
          setShowDeleteDialog(false);
          setSelectedNetworkIds(new Set());
          // Refresh network list after a short delay
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start delete operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete networks');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleProgressComplete = () => {
    // When progress tracking is complete, return to network list
    setDeleteSessionId(null);
    setSelectedNetworkIds(new Set());
    handleRefresh();
  };

  const handleCreateComplete = () => {
    setShowCreateForm(false);
    handleRefresh();
  };

  const handleActivateClick = () => {
    if (selectedNetworkIds.size > 0) {
      setShowActivateDialog(true);
    }
  };

  const handleToggleVenue = (venueId: string) => {
    const newSelection = new Set(selectedVenueIds);
    if (newSelection.has(venueId)) {
      newSelection.delete(venueId);
    } else {
      newSelection.add(venueId);
    }
    setSelectedVenueIds(newSelection);
  };

  const handleCancelActivate = () => {
    setShowActivateDialog(false);
    setSelectedVenueIds(new Set());
  };

  const handleConfirmActivate = async () => {
    if (selectedVenueIds.size === 0) {
      setError('Please select at least one venue');
      return;
    }

    setIsActivating(true);
    try {
      // Build venue configs for each selected venue
      const venueConfigs = Array.from(selectedVenueIds).map(venueId => ({
        venueId,
        scheduler: { type: 'ALWAYS_ON' }
      }));

      const request = {
        networkIds: Array.from(selectedNetworkIds),
        venueConfigs,
        options: {
          maxConcurrent: activateMaxConcurrent,
          delayMs: activateDelayMs
        }
      };

      const response = await apiService.bulkActivateWlans(request);

      if (response.success && response.data) {
        if (activateWaitMode === 'track') {
          // Switch to progress tracking view
          setActivateSessionId(response.data.sessionId);
          setShowActivateDialog(false);
        } else {
          // Fire and forget mode
          setShowActivateDialog(false);
          setSelectedNetworkIds(new Set());
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start activate operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to activate networks');
    } finally {
      setIsActivating(false);
    }
  };

  const handleActivateProgressComplete = () => {
    setActivateSessionId(null);
    setSelectedNetworkIds(new Set());
    handleRefresh();
  };

  const handleDeactivateClick = () => {
    if (selectedNetworkIds.size > 0) {
      setShowDeactivateDialog(true);
    }
  };

  const handleToggleDeactivateVenue = (venueId: string) => {
    const newSelection = new Set(deactivateVenueIds);
    if (newSelection.has(venueId)) {
      newSelection.delete(venueId);
    } else {
      newSelection.add(venueId);
    }
    setDeactivateVenueIds(newSelection);
  };

  const handleCancelDeactivate = () => {
    setShowDeactivateDialog(false);
    setDeactivateVenueIds(new Set());
  };

  const handleConfirmDeactivate = async () => {
    if (deactivateVenueIds.size === 0) {
      setError('Please select at least one venue');
      return;
    }

    setIsDeactivating(true);
    try {
      const request = {
        networkIds: Array.from(selectedNetworkIds),
        venueIds: Array.from(deactivateVenueIds),
        options: {
          maxConcurrent: deactivateMaxConcurrent,
          delayMs: deactivateDelayMs
        }
      };

      const response = await apiService.bulkDeactivateWlans(request);

      if (response.success && response.data) {
        if (deactivateWaitMode === 'track') {
          setDeactivateSessionId(response.data.sessionId);
          setShowDeactivateDialog(false);
        } else {
          setShowDeactivateDialog(false);
          setSelectedNetworkIds(new Set());
          setTimeout(() => {
            handleRefresh();
          }, 1000);
        }
      } else {
        setError(response.error || 'Failed to start deactivate operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to deactivate networks');
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeactivateProgressComplete = () => {
    setDeactivateSessionId(null);
    setSelectedNetworkIds(new Set());
    handleRefresh();
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'guest':
        return 'bg-blue-100 text-blue-800';
      case 'psk':
        return 'bg-green-100 text-green-800';
      case 'enterprise':
        return 'bg-yellow-100 text-yellow-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNetworkStatus = (network: WifiNetwork) => {
    const venueCount = network.venueApGroups?.length || 0;
    if (venueCount > 0) {
      return {
        text: `Active (${venueCount} venue${venueCount > 1 ? 's' : ''})`,
        badge: 'bg-green-100 text-green-800'
      };
    } else {
      return {
        text: 'Not Activated',
        badge: 'bg-gray-100 text-gray-800'
      };
    }
  };

  // Get venues where selected networks can be activated (not already there)
  const getActivatableVenues = () => {
    const selectedNetworks = wlans.filter(w => selectedNetworkIds.has(w.id));
    if (selectedNetworks.length === 0) return [];

    // For each venue, check if ANY selected network is already activated there
    return venues.filter(venue => {
      // Check if this venue already has any of the selected networks
      const hasAnyNetwork = selectedNetworks.some(network =>
        network.venueApGroups?.some(vag => vag.venueId === venue.id)
      );
      // Only show venues where none of the selected networks are activated
      return !hasAnyNetwork;
    });
  };

  // Get venues where ALL selected networks are currently activated
  const getDeactivatableVenues = () => {
    const selectedNetworks = wlans.filter(w => selectedNetworkIds.has(w.id));
    if (selectedNetworks.length === 0) return [];

    // For each venue, check if ALL selected networks are activated there
    return venues.filter(venue => {
      // All selected networks must be at this venue
      return selectedNetworks.every(network =>
        network.venueApGroups?.some(vag => vag.venueId === venue.id)
      );
    });
  };

  // Check if any selected network is activated at any venue
  const hasActivatedNetworks = () => {
    const selectedNetworks = wlans.filter(w => selectedNetworkIds.has(w.id));
    return selectedNetworks.some(network =>
      network.venueApGroups && network.venueApGroups.length > 0
    );
  };

  // If showing progress tracking view for delete
  if (deleteSessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleProgressComplete}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to WiFi Networks
          </button>
        </div>
        <OperationProgress sessionId={deleteSessionId} />
      </div>
    );
  }

  // If showing progress tracking view for activate
  if (activateSessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleActivateProgressComplete}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to WiFi Networks
          </button>
        </div>
        <OperationProgress sessionId={activateSessionId} />
      </div>
    );
  }

  // If showing progress tracking view for deactivate
  if (deactivateSessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={handleDeactivateProgressComplete}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to WiFi Networks
          </button>
        </div>
        <OperationProgress sessionId={deactivateSessionId} />
      </div>
    );
  }

  // If showing create form
  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to WiFi Networks
          </button>
        </div>
        <BulkWlanForm onComplete={handleCreateComplete} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">WiFi Networks (Guest Pass)</h2>
            <p className="text-sm text-gray-600 mt-1">
              View and manage WiFi networks from RUCKUS One
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <span className={isRefreshing ? 'animate-spin' : ''}>↻</span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Error Loading WiFi Networks</h3>
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600"></div>
            <p className="text-gray-600">Loading WiFi networks...</p>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete WiFi Networks</h3>
            <p className="text-gray-700 mb-6">
              You are about to delete <span className="font-bold text-red-600">{selectedNetworkIds.size}</span> network(s). This action cannot be undone.
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
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? 'Starting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activate Confirmation Dialog */}
      {showActivateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Activate WiFi Networks</h3>
            <p className="text-gray-700 mb-6">
              Activating <span className="font-bold text-blue-600">{selectedNetworkIds.size}</span> network(s) at selected venues.
            </p>

            <div className="space-y-6 mb-6">
              {/* Venue Selection Section */}
              <div className="bg-gradient-to-b from-blue-50 to-white rounded-lg p-4 shadow-sm border border-blue-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Target Venues</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Venues <span className="text-red-600">*</span>
                    {selectedVenueIds.size > 0 && (
                      <span className="ml-2 text-blue-600 font-normal">
                        ({selectedVenueIds.size} selected)
                      </span>
                    )}
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white shadow-inner">
                    {getActivatableVenues().length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        {venues.length === 0
                          ? 'No venues available'
                          : 'Selected networks are already activated at all venues'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getActivatableVenues().map(venue => (
                          <label
                            key={venue.id}
                            className="flex items-center px-3 py-2.5 hover:bg-blue-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedVenueIds.has(venue.id)}
                              onChange={() => handleToggleVenue(venue.id)}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 mr-3"
                            />
                            <span className="text-sm text-gray-900">{venue.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operation Options Section */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Operation Options</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Concurrent (1-20)
                      </label>
                      <input
                        type="number"
                        value={activateMaxConcurrent}
                        onChange={(e) => setActivateMaxConcurrent(Number(e.target.value))}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay Between Ops (ms)
                      </label>
                      <input
                        type="number"
                        value={activateDelayMs}
                        onChange={(e) => setActivateDelayMs(Number(e.target.value))}
                        min="0"
                        max="10000"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
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
                          checked={activateWaitMode === 'track'}
                          onChange={(e) => setActivateWaitMode(e.target.value as 'track' | 'fire')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Track Progress - Show detailed progress</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="fire"
                          checked={activateWaitMode === 'fire'}
                          onChange={(e) => setActivateWaitMode(e.target.value as 'track' | 'fire')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Fire and Forget - Start and return immediately</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelActivate}
                disabled={isActivating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmActivate}
                disabled={selectedVenueIds.size === 0 || isActivating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isActivating ? 'Starting...' : 'Activate Networks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirmation Dialog */}
      {showDeactivateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Deactivate WiFi Networks</h3>
            <p className="text-gray-700 mb-6">
              Deactivating <span className="font-bold text-yellow-600">{selectedNetworkIds.size}</span> network(s) from selected venues.
            </p>

            <div className="space-y-6 mb-6">
              {/* Venue Selection Section */}
              <div className="bg-gradient-to-b from-yellow-50 to-white rounded-lg p-4 shadow-sm border border-yellow-100">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Target Venues</h4>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Venues <span className="text-red-600">*</span>
                    {deactivateVenueIds.size > 0 && (
                      <span className="ml-2 text-yellow-600 font-normal">
                        ({deactivateVenueIds.size} selected)
                      </span>
                    )}
                  </label>
                  <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto bg-white shadow-inner">
                    {getDeactivatableVenues().length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-500 text-center">
                        {venues.length === 0
                          ? 'No venues available'
                          : 'Selected networks are not activated at any common venues'}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {getDeactivatableVenues().map(venue => (
                          <label
                            key={venue.id}
                            className="flex items-center px-3 py-2.5 hover:bg-yellow-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={deactivateVenueIds.has(venue.id)}
                              onChange={() => handleToggleDeactivateVenue(venue.id)}
                              className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-2 focus:ring-yellow-500 mr-3"
                            />
                            <span className="text-sm text-gray-900">{venue.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Operation Options Section */}
              <div className="bg-gradient-to-b from-gray-50 to-white rounded-lg p-4 shadow-sm border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Operation Options</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Concurrent (1-20)
                      </label>
                      <input
                        type="number"
                        value={deactivateMaxConcurrent}
                        onChange={(e) => setDeactivateMaxConcurrent(Number(e.target.value))}
                        min="1"
                        max="20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delay Between Ops (ms)
                      </label>
                      <input
                        type="number"
                        value={deactivateDelayMs}
                        onChange={(e) => setDeactivateDelayMs(Number(e.target.value))}
                        min="0"
                        max="10000"
                        step="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                      />
                    </div>
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
                          checked={deactivateWaitMode === 'track'}
                          onChange={(e) => setDeactivateWaitMode(e.target.value as 'track' | 'fire')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Track Progress - Show detailed progress</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="fire"
                          checked={deactivateWaitMode === 'fire'}
                          onChange={(e) => setDeactivateWaitMode(e.target.value as 'track' | 'fire')}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Fire and Forget - Start and return immediately</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelDeactivate}
                disabled={isDeactivating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeactivate}
                disabled={deactivateVenueIds.size === 0 || isDeactivating}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeactivating ? 'Starting...' : 'Deactivate Networks'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WiFi Networks Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">
                All Networks ({wlans.length})
              </h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(true)}
                  disabled={selectedNetworkIds.size > 0}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>➕</span>
                  Create Network
                </button>
                <button
                  onClick={handleActivateClick}
                  disabled={selectedNetworkIds.size !== 1 || getActivatableVenues().length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>✓</span>
                  Activate
                </button>
                <button
                  onClick={handleDeactivateClick}
                  disabled={selectedNetworkIds.size !== 1 || getDeactivatableVenues().length === 0}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>✗</span>
                  Deactivate
                </button>
                <button
                  onClick={handleDeleteClick}
                  disabled={selectedNetworkIds.size === 0 || hasActivatedNetworks()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <span>🗑️</span>
                  Delete {selectedNetworkIds.size > 0 && `(${selectedNetworkIds.size})`}
                </button>
              </div>
            </div>
          </div>

          {wlans.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-gray-400 text-5xl mb-4">📶</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No WiFi Networks Found</h3>
              <p className="text-gray-600">
                No WiFi networks are currently configured. Click "Create Network" to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedNetworkIds.size === wlans.length && wlans.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Network Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      SSID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {wlans.map((network) => (
                    <tr
                      key={network.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedNetworkIds.has(network.id)}
                          onChange={() => handleSelectNetwork(network.id)}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {network.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {network.ssid}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeBadge(network.type)}`}>
                          {network.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getNetworkStatus(network).badge}`}>
                          {getNetworkStatus(network).text}
                        </span>
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
