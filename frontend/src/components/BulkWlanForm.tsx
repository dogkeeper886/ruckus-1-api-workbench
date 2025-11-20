import React, { useState } from 'react';
import { apiService } from '../services/api';
import { BulkWlanCreateRequest } from '../../../shared/types';
import { OperationProgress } from './OperationProgress';

export const BulkWlanForm: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [namePrefix, setNamePrefix] = useState('TestWLAN-');
  const [nameSuffix, setNameSuffix] = useState('');
  const [ssidPrefix, setSsidPrefix] = useState('TestSSID-');
  const [ssidSuffix, setSsidSuffix] = useState('');
  const [count, setCount] = useState(10);
  const [startStep, setStartStep] = useState(1);
  const [type, setType] = useState<'psk' | 'enterprise' | 'open' | 'guest'>('psk');
  const [wlanSecurity, setWlanSecurity] = useState('WPA2Personal');
  const [passphrase, setPassphrase] = useState('TestPassword123');
  const [vlanId, setVlanId] = useState(1);
  const [maxConcurrent, setMaxConcurrent] = useState(5);
  const [delayMs, setDelayMs] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        vlanId,
        options: { maxConcurrent, delayMs }
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

  if (sessionId) {
    return (
      <div>
        <button
          onClick={() => setSessionId(null)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          ← Back to Form
        </button>
        <OperationProgress sessionId={sessionId} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Bulk WLAN Operations</h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Naming Pattern</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Prefix</label>
              <input
                type="text"
                value={namePrefix}
                onChange={(e) => setNamePrefix(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name Suffix</label>
              <input
                type="text"
                value={nameSuffix}
                onChange={(e) => setNameSuffix(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SSID Prefix</label>
              <input
                type="text"
                value={ssidPrefix}
                onChange={(e) => setSsidPrefix(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">SSID Suffix</label>
              <input
                type="text"
                value={ssidSuffix}
                onChange={(e) => setSsidSuffix(e.target.value)}
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
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">WLAN Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="psk">PSK</option>
                <option value="enterprise">Enterprise</option>
                <option value="open">Open</option>
                <option value="guest">Guest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Security</label>
              <select
                value={wlanSecurity}
                onChange={(e) => setWlanSecurity(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="WPA2Personal">WPA2 Personal</option>
                <option value="WPA3Personal">WPA3 Personal</option>
                <option value="Open">Open</option>
              </select>
            </div>
            {type === 'psk' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Passphrase</label>
                <input
                  type="text"
                  value={passphrase}
                  onChange={(e) => setPassphrase(e.target.value)}
                  minLength={8}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">VLAN ID</label>
              <input
                type="number"
                value={vlanId}
                onChange={(e) => setVlanId(Number(e.target.value))}
                min="1"
                max="4094"
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
          {isSubmitting ? 'Starting...' : `Create ${count} WLANs`}
        </button>
      </form>
    </div>
  );
};
