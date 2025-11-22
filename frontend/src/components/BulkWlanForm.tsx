import React, { useState } from 'react';
import { apiService } from '../services/api';
import { BulkWlanCreateRequest } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

interface Props {
  onComplete?: () => void;
}

export const BulkWlanForm: React.FC<Props> = ({ onComplete }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Create form state - Naming
  const [namePrefix, setNamePrefix] = useState('GuestNet-');
  const [nameSuffix, setNameSuffix] = useState('');
  const [ssidPrefix, setSsidPrefix] = useState('Guest-');
  const [ssidSuffix, setSsidSuffix] = useState('');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);

  // Network configuration
  const [type, setType] = useState<'psk' | 'enterprise' | 'open' | 'guest'>('guest');
  const [wlanSecurity, setWlanSecurity] = useState('WPA2Personal');
  const [passphrase, setPassphrase] = useState('');
  const [portalServiceProfileId, setPortalServiceProfileId] = useState('');
  const [vlanId, setVlanId] = useState<number | undefined>(undefined);

  // Options
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const request: BulkWlanCreateRequest = {
        namePrefix,
        nameSuffix,
        ssidPrefix,
        ssidSuffix,
        count,
        startStep,
        type,
        wlanSecurity,
        passphrase: type === 'psk' ? passphrase : undefined,
        portalServiceProfileId: type === 'guest' ? portalServiceProfileId : undefined,
        vlanId,
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
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <button
            onClick={resetForm}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
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
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Network Naming</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Suffix</label>
              <input
                type="text"
                value={nameSuffix}
                onChange={(e) => setNameSuffix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">SSID Suffix</label>
              <input
                type="text"
                value={ssidSuffix}
                onChange={(e) => setSsidSuffix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              Preview: {namePrefix}{startStep}{nameSuffix} (SSID: {ssidPrefix}{startStep}{ssidSuffix}), {namePrefix}{startStep + 1}{nameSuffix} (SSID: {ssidPrefix}{startStep + 1}{ssidSuffix}), ...
            </p>
          </div>
        </div>

        {/* Network Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Network Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Network Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as 'psk' | 'enterprise' | 'open' | 'guest')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="guest">Guest</option>
                <option value="psk">PSK (Pre-Shared Key)</option>
                <option value="enterprise">Enterprise</option>
                <option value="open">Open</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
              <select
                value={wlanSecurity}
                onChange={(e) => setWlanSecurity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="WPA2Personal">WPA2 Personal</option>
                <option value="WPA3Personal">WPA3 Personal</option>
                <option value="WPA2Enterprise">WPA2 Enterprise</option>
                <option value="WPA3Enterprise">WPA3 Enterprise</option>
                <option value="Open">Open</option>
                <option value="None">None</option>
              </select>
            </div>

            {type === 'psk' && (
              <div className="col-span-2">
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
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Portal Service Profile ID
                </label>
                <input
                  type="text"
                  value={portalServiceProfileId}
                  onChange={(e) => setPortalServiceProfileId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={type === 'guest'}
                  placeholder="e.g., 12345678-1234-1234-1234-123456789012"
                />
                <p className="text-xs text-gray-500 mt-1">Required for guest networks</p>
              </div>
            )}

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VLAN ID (Optional)
              </label>
              <input
                type="number"
                value={vlanId || ''}
                onChange={(e) => setVlanId(e.target.value ? Number(e.target.value) : undefined)}
                min="1"
                max="4094"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Leave empty for default"
              />
              <p className="text-xs text-gray-500 mt-1">VLAN ID range: 1-4094</p>
            </div>
          </div>
        </div>

        {/* Operation Options */}
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
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isSubmitting ? 'Starting...' : `Create ${count} WiFi Networks`}
        </button>
      </form>
    </div>
  );
};
