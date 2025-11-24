import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { BulkGuestPassCreateRequest, WifiNetwork } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

interface Props {
  onComplete?: () => void;
}

export const BulkGuestPassForm: React.FC<Props> = ({ onComplete }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [guestPassNetworks, setGuestPassNetworks] = useState<WifiNetwork[]>([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(true);

  // Form state
  const [networkId, setNetworkId] = useState('');
  const [namePrefix, setNamePrefix] = useState('GuestPass-');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);

  // Expiration settings
  const [expirationDuration, setExpirationDuration] = useState(7);
  const [expirationUnit, setExpirationUnit] = useState<'Hour' | 'Day' | 'Week' | 'Month'>('Day');
  const [activationType, setActivationType] = useState<'Creation' | 'FirstUse'>('Creation');

  // Guest pass settings
  const [maxDevices, setMaxDevices] = useState(2);

  // Options
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load guest pass WLANs
  useEffect(() => {
    const loadNetworks = async () => {
      try {
        setIsLoadingNetworks(true);
        const networks = await apiService.getWlans();

        // Filter for guest pass networks only
        const guestPassNets = networks.filter(
          (net) => net.nwSubType === 'guest' || net.type === 'guest'
        );

        setGuestPassNetworks(guestPassNets);

        // Auto-select first network if available
        if (guestPassNets.length > 0 && !networkId) {
          setNetworkId(guestPassNets[0].id);
        }
      } catch (err: any) {
        console.error('Error loading networks:', err);
        setError('Failed to load guest pass networks');
      } finally {
        setIsLoadingNetworks(false);
      }
    };

    loadNetworks();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const request: BulkGuestPassCreateRequest = {
        networkId,
        namePrefix,
        count,
        startStep,
        expiration: {
          duration: expirationDuration,
          unit: expirationUnit,
          activationType
        },
        maxDevices,
        deliveryMethods: ['PRINT'],
        options: {
          maxConcurrent,
          delayMs
        }
      };

      const response = await apiService.bulkCreateGuestPasses(request);
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

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bulk Guest Pass Creation</h2>

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

      <form onSubmit={handleCreateSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Guest Pass Network</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WiFi Network (Guest Pass)
            </label>
            {isLoadingNetworks ? (
              <div className="text-sm text-gray-500">Loading networks...</div>
            ) : guestPassNetworks.length === 0 ? (
              <div className="text-sm text-red-600">No guest pass networks found. Please create a guest pass WLAN first.</div>
            ) : (
              <select
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {guestPassNetworks.map((net) => (
                  <option key={net.id} value={net.id}>
                    {net.name} ({net.ssid})
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Naming Pattern</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prefix</label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
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

        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Credential Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Duration
              </label>
              <input
                type="number"
                value={expirationDuration}
                onChange={(e) => setExpirationDuration(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Unit
              </label>
              <select
                value={expirationUnit}
                onChange={(e) => setExpirationUnit(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Hour">Hour</option>
                <option value="Day">Day</option>
                <option value="Week">Week</option>
                <option value="Month">Month</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Activation Type
              </label>
              <select
                value={activationType}
                onChange={(e) => setActivationType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Creation">Activate on Creation</option>
                <option value="FirstUse">Activate on First Use</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Devices per Pass
              </label>
              <input
                type="number"
                value={maxDevices}
                onChange={(e) => setMaxDevices(Number(e.target.value))}
                min="1"
                max="50"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
        </div>

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
          disabled={isSubmitting || guestPassNetworks.length === 0}
          className="w-full btn-primary font-semibold"
        >
          {isSubmitting ? 'Starting...' : `Create ${count} Guest Passes`}
        </button>
      </form>
    </div>
  );
};
