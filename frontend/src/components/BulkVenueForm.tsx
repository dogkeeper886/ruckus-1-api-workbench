import React, { useState } from 'react';
import { apiService } from '../services/api';
import { BulkVenueCreateRequest, BulkVenueDeleteRequest } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

interface Props {
  onComplete?: () => void;
}

export const BulkVenueForm: React.FC<Props> = ({ onComplete }) => {
  const [action, setAction] = useState<'create' | 'delete'>('create');
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create form state
  const [prefix, setPrefix] = useState('TestVenue-');
  const [suffix, setSuffix] = useState('');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);
  const [addressLine, setAddressLine] = useState('New York');
  const [city, setCity] = useState('New York');
  const [country, setCountry] = useState('United States');
  const [timezone, setTimezone] = useState('America/New_York');

  // Delete form state
  const [venueIds, setVenueIds] = useState('');

  // Options
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const request: BulkVenueCreateRequest = {
        prefix,
        suffix,
        count,
        startStep,
        addressLine,
        city,
        country,
        timezone,
        options: {
          maxConcurrent,
          delayMs
        }
      };

      const response = await apiService.bulkCreateVenues(request);
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

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const ids = venueIds.split('\n').map(id => id.trim()).filter(id => id.length > 0);

      if (ids.length === 0) {
        setError('Please enter at least one venue ID');
        setIsSubmitting(false);
        return;
      }

      const request: BulkVenueDeleteRequest = {
        venueIds: ids,
        options: {
          maxConcurrent,
          delayMs
        }
      };

      const response = await apiService.bulkDeleteVenues(request);
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
      <div>
        <button
          onClick={resetForm}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to Form
        </button>
        <OperationProgress sessionId={sessionId} onComplete={onComplete} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bulk Venue Operations</h2>

      {/* Action Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="create"
              checked={action === 'create'}
              onChange={(e) => setAction(e.target.value as 'create' | 'delete')}
              className="mr-2"
            />
            Create Venues
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="delete"
              checked={action === 'delete'}
              onChange={(e) => setAction(e.target.value as 'create' | 'delete')}
              className="mr-2"
            />
            Delete Venues
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {action === 'create' ? (
        <form onSubmit={handleCreateSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Naming Pattern</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
                <input
                  type="text"
                  value={prefix}
                  onChange={(e) => setPrefix(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Suffix</label>
                <input
                  type="text"
                  value={suffix}
                  onChange={(e) => setSuffix(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Count</label>
                <input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  min="1"
                  max="1000"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Step</label>
                <input
                  type="number"
                  value={startStep}
                  onChange={(e) => setStartStep(Number(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm text-gray-600">
                Preview: {prefix}{startStep}{suffix}, {prefix}{startStep + 1}{suffix}, ...
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Venue Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={addressLine}
                  onChange={(e) => setAddressLine(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                <input
                  type="text"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Operation Options</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border rounded-md"
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
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Starting...' : `Create ${count} Venues`}
          </button>
        </form>
      ) : (
        <form onSubmit={handleDeleteSubmit} className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Venue IDs to Delete</h3>
            <textarea
              value={venueIds}
              onChange={(e) => setVenueIds(e.target.value)}
              placeholder="Enter venue IDs, one per line"
              rows={10}
              className="w-full px-3 py-2 border rounded-md font-mono text-sm"
              required
            />
            <p className="mt-2 text-sm text-gray-600">
              {venueIds.split('\n').filter(id => id.trim().length > 0).length} venues to delete
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Operation Options</h3>
            <div className="grid grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border rounded-md"
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
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400"
          >
            {isSubmitting ? 'Starting...' : 'Delete Venues'}
          </button>
        </form>
      )}
    </div>
  );
};
