import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { BulkApAddRequest, Venue } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

interface Props {
  onComplete?: () => void;
}

export const BulkApForm: React.FC<Props> = ({ onComplete }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Form state
  const [namePrefix, setNamePrefix] = useState('AP-');
  const [startSerialNumber, setStartSerialNumber] = useState('12140300133');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);
  const [description, setDescription] = useState('');

  // Venue and AP Group selection
  const [venues, setVenues] = useState<Venue[]>([]);
  const [apGroups, setApGroups] = useState<any[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [selectedApGroupId, setSelectedApGroupId] = useState('');
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isLoadingApGroups, setIsLoadingApGroups] = useState(false);

  // Options
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load venues on mount
  useEffect(() => {
    const loadVenues = async () => {
      setIsLoadingVenues(true);
      try {
        const venuesData = await apiService.getVenues();
        setVenues(venuesData);
      } catch (err: any) {
        console.error('Error loading venues:', err);
        setError('Failed to load venues');
      } finally {
        setIsLoadingVenues(false);
      }
    };
    loadVenues();
  }, []);

  // Load AP groups when venue is selected
  useEffect(() => {
    if (!selectedVenueId) {
      setApGroups([]);
      setSelectedApGroupId('');
      return;
    }

    const loadApGroups = async () => {
      setIsLoadingApGroups(true);
      try {
        // Fetch AP groups filtered by selected venue
        const apGroupsData = await apiService.getApGroups(selectedVenueId);
        console.log('[BulkApForm] AP groups for venue:', selectedVenueId, apGroupsData);
        
        // Get AP groups for this venue
        const venueGroups = apGroupsData.data || [];
        setApGroups(venueGroups);
        
        // Auto-select first group if available
        if (venueGroups.length > 0 && !selectedApGroupId) {
          setSelectedApGroupId(venueGroups[0].id);
        }
      } catch (err: any) {
        console.error('Error loading AP groups:', err);
        setError('Failed to load AP groups');
      } finally {
        setIsLoadingApGroups(false);
      }
    };
    loadApGroups();
  }, [selectedVenueId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedVenueId) {
      setError('Please select a venue');
      return;
    }

    if (!selectedApGroupId) {
      setError('Please select an AP group');
      return;
    }

    setIsSubmitting(true);

    try {
      const request: BulkApAddRequest = {
        namePrefix,
        nameSuffix: '',
        startSerialNumber,
        count,
        startStep,
        venueId: selectedVenueId,
        apGroupId: selectedApGroupId,
        description,
        options: {
          maxConcurrent,
          delayMs
        }
      };

      const response = await apiService.bulkAddAps(request);
      if (response.success && response.data) {
        setSessionId(response.data.sessionId);
      } else {
        setError(response.error || 'Failed to start operation');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSessionId(null);
    setError(null);
  };

  if (sessionId) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-small border border-gray-200 p-6">
          <button
            onClick={resetForm}
            className="btn-secondary"
          >
            ← Back to Form
          </button>
        </div>
        <OperationProgress sessionId={sessionId} onComplete={onComplete} />
      </div>
    );
  }

  const selectedVenue = venues.find(v => v.id === selectedVenueId);

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bulk AP Addition</h2>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-red-600 text-xl">⚠</span>
            <div className="flex-1">
              <h3 className="text-red-800 font-semibold">Error</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Venue and AP Group Selection */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Target Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedVenueId}
                onChange={(e) => setSelectedVenueId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoadingVenues}
              >
                <option value="">
                  {isLoadingVenues ? 'Loading venues...' : 'Select a venue'}
                </option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AP Group <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedApGroupId}
                onChange={(e) => setSelectedApGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedVenueId || isLoadingApGroups}
              >
                <option value="">
                  {!selectedVenueId
                    ? 'Select venue first'
                    : isLoadingApGroups
                    ? 'Loading AP groups...'
                    : 'Select an AP group'}
                </option>
                {apGroups.map((group: any) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedVenue && (
            <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-blue-700">
              <strong>Selected Venue:</strong> {selectedVenue.name}
              {selectedVenue.city && ` (${selectedVenue.city})`}
            </div>
          )}
        </div>

        {/* Naming Pattern */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Naming Pattern</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name Prefix
              </label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Step
              </label>
              <input
                type="number"
                value={startStep}
                onChange={(e) => setStartStep(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Count
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                min="1"
                max="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Preview: {namePrefix}{startStep}, {namePrefix}{startStep + 1}, {namePrefix}{startStep + 2}, ...
            </p>
          </div>
        </div>

        {/* Serial Number Pattern */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Serial Number Pattern</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Starting Serial Number
              </label>
              <input
                type="text"
                value={startSerialNumber}
                onChange={(e) => setStartSerialNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., 12140300133"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the first serial number
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Test APs"
              />
            </div>
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              Serial Preview: {startSerialNumber}, {(parseInt(startSerialNumber) + 1).toString()}, {(parseInt(startSerialNumber) + 2).toString()}, ...
            </p>
          </div>
        </div>

        {/* Operation Options */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Operation Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Concurrent (1-20)
              </label>
              <input
                type="number"
                value={maxConcurrent}
                onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay Between Ops (ms)
              </label>
              <input
                type="number"
                value={delayMs}
                onChange={(e) => setDelayMs(Number(e.target.value))}
                min="0"
                max="10000"
                step="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !selectedVenueId || !selectedApGroupId}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Starting...' : `Add ${count} APs`}
        </button>
      </form>
    </div>
  );
};

