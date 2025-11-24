import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { BulkWlanCreateRequest } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

interface Props {
  onComplete?: () => void;
}

export const BulkWlanForm: React.FC<Props> = ({ onComplete }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create form state - Naming
  const [namePrefix, setNamePrefix] = useState('Network-');
  const [ssidPrefix, setSsidPrefix] = useState('WiFi-');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);

  // Network configuration
  const [type, setType] = useState<'psk' | 'guest'>('psk');
  const [passphrase, setPassphrase] = useState('');
  const [portalServiceProfileId, setPortalServiceProfileId] = useState('');
  const [portalProfiles, setPortalProfiles] = useState<any[]>([]);

  // Options
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch portal profiles on mount
  useEffect(() => {
    const fetchPortalProfiles = async () => {
      try {
        const profiles = await apiService.getPortalProfiles();
        setPortalProfiles(profiles);
      } catch (err) {
        console.error('Error fetching portal profiles:', err);
      }
    };
    fetchPortalProfiles();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (type === 'psk' && !passphrase) {
      setError('Passphrase is required for PSK networks');
      return;
    }

    if (type === 'guest' && !portalServiceProfileId) {
      setError('Portal Service Profile ID is required for guest networks');
      return;
    }

    setIsSubmitting(true);

    try {
      // Auto-set wlanSecurity based on network type
      const wlanSecurity = type === 'psk' ? 'WPA2Personal' : 'None';

      const request: BulkWlanCreateRequest = {
        namePrefix,
        ssidPrefix,
        count,
        startStep,
        type,
        wlanSecurity,
        passphrase: type === 'psk' ? passphrase : undefined,
        portalServiceProfileId: type === 'guest' ? portalServiceProfileId : undefined,
        options: {
          maxConcurrent,
          delayMs
        }
      };

      const response = await apiService.bulkCreateWlans(request);
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
      <h2 className="text-2xl font-bold mb-6">Bulk WiFi Network Creation</h2>

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
        {/* Network Naming */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Network Naming</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Prefix</label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SSID Prefix</label>
              <input
                type="text"
                value={ssidPrefix}
                onChange={(e) => setSsidPrefix(e.target.value)}
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
              Preview: {namePrefix}{startStep} (SSID: {ssidPrefix}{startStep}), {namePrefix}{startStep + 1} (SSID: {ssidPrefix}{startStep + 1}), ...
            </p>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="bg-white rounded-lg shadow-medium p-6">
          <h3 className="text-lg font-semibold mb-4">Network Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Network Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'psk' | 'guest')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="psk">WPA2/PSK</option>
                <option value="guest">Guest Pass</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {type === 'psk' ? 'WPA2 Personal with pre-shared key' : 'Guest network with portal authentication'}
              </p>
            </div>

            {type === 'psk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passphrase</label>
                <input
                  type="password"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={type === 'psk'}
                  minLength={8}
                />
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
              </div>
            )}

            {type === 'guest' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portal Service Profile
                </label>
                <select
                  value={portalServiceProfileId}
                  onChange={(e) => setPortalServiceProfileId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={type === 'guest'}
                >
                  <option value="">Select a portal profile...</option>
                  {portalProfiles.map((profile) => (
                    <option key={profile.id} value={profile.id}>
                      {profile.serviceName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Required for guest networks with portal service</p>
              </div>
            )}
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
          disabled={isSubmitting}
          className="w-full btn-primary font-semibold"
        >
          {isSubmitting ? 'Starting...' : `Create ${count} WiFi Networks`}
        </button>
      </form>
    </div>
  );
};
