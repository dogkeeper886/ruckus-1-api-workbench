import React, { useEffect, useState, useRef } from 'react';
import { apiService } from '../services/api';
import { BulkOperationProgress, BulkOperationSession, Operation } from '../../../shared/types';

interface Props {
  sessionId: string;
  onComplete?: () => void;
}

export const OperationProgress: React.FC<Props> = ({ sessionId, onComplete }) => {
  const [progress, setProgress] = useState<BulkOperationProgress | null>(null);
  const [session, setSession] = useState<BulkOperationSession | null>(null);
  const [operations, setOperations] = useState<Operation[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressResp, sessionResp, operationsResp] = await Promise.all([
          apiService.getSessionProgress(sessionId),
          apiService.getSession(sessionId),
          apiService.getSessionOperations(sessionId)
        ]);

        if (progressResp.success && progressResp.data) {
          setProgress(progressResp.data);
        }
        if (sessionResp.success && sessionResp.data) {
          setSession(sessionResp.data);
          if (sessionResp.data.status === 'completed' || sessionResp.data.status === 'cancelled') {
            setIsPolling(false);
            // Only auto-return if there were no failures
            // If there were failures, let user manually go back to review errors
            if (progressResp.data && progressResp.data.failureCount === 0) {
              onComplete?.();
            }
          }
        }
        if (operationsResp.success && operationsResp.data) {
          setOperations(operationsResp.data);
        }
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchData();

    if (isPolling) {
      const interval = setInterval(fetchData, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionId, isPolling, onComplete]);

  // Auto-scroll to bottom when operations update
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [operations]);

  const handlePause = async () => {
    try {
      await apiService.pauseSession(sessionId);
    } catch (error) {
      console.error('Error pausing session:', error);
    }
  };

  const handleResume = async () => {
    try {
      await apiService.resumeSession(sessionId);
      setIsPolling(true);
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  const handleCancel = async () => {
    try {
      await apiService.cancelSession(sessionId);
      setIsPolling(false);
    } catch (error) {
      console.error('Error cancelling session:', error);
    }
  };

  if (!progress || !session) {
    return <div className="text-center py-4">Loading...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'running': return 'text-blue-600';
      case 'cancelled': return 'text-gray-600';
      default: return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Operation Progress</h3>
          <div className="flex gap-2">
            {session.status === 'running' && (
              <button
                onClick={handlePause}
                className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Pause
              </button>
            )}
            {session.status === 'paused' && (
              <button
                onClick={handleResume}
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Resume
              </button>
            )}
            {(session.status === 'running' || session.status === 'paused') && (
              <button
                onClick={handleCancel}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>{progress.completedCount} / {progress.totalCount} completed</span>
            <span>{progress.progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-blue-600 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{progress.successCount}</div>
            <div className="text-sm text-gray-600">Success</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{progress.failureCount}</div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{progress.runningCount}</div>
            <div className="text-sm text-gray-600">Running</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{progress.queuedCount}</div>
            <div className="text-sm text-gray-600">Queued</div>
          </div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Operations</h3>
        </div>
        <div ref={tableContainerRef} className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Error
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {operations.map((op) => (
                <tr 
                  key={op.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    setSelectedOperation(op);
                    setShowDebugPanel(true);
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {op.itemName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(op.status)}`}>
                      {op.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {op.duration ? `${(op.duration / 1000).toFixed(2)}s` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    {op.error || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Debug Panel */}
      <div className="bg-white rounded-lg shadow">
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50"
        >
          <h3 className="text-lg font-semibold">Debug Information</h3>
          <span className="text-gray-500">
            {showDebugPanel ? '▼' : '▶'}
          </span>
        </button>
        
        {showDebugPanel && (
          <div className="px-6 py-4 border-t space-y-4">
            {selectedOperation ? (
              <>
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-semibold text-gray-700">Operation: {selectedOperation.itemName}</h4>
                    <button
                      onClick={() => setSelectedOperation(null)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Show Session Info
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Status: <span className={getStatusColor(selectedOperation.status)}>{selectedOperation.status}</span>
                    {selectedOperation.activityId && <span className="ml-4">Activity ID: {selectedOperation.activityId}</span>}
                  </div>
                </div>

                {/* Request Data */}
                {selectedOperation.requestData && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700">Request Payload</h5>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedOperation.requestData, null, 2))}
                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
                      {JSON.stringify(selectedOperation.requestData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Response Data */}
                {selectedOperation.responseData && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h5 className="font-medium text-gray-700">Response Data</h5>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(selectedOperation.responseData, null, 2))}
                        className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                      >
                        Copy
                      </button>
                    </div>
                    <pre className="bg-gray-50 p-4 rounded overflow-x-auto text-xs">
                      {JSON.stringify(selectedOperation.responseData, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Error Details */}
                {selectedOperation.error && (
                  <div>
                    <h5 className="font-medium text-red-700 mb-2">Error Details</h5>
                    <pre className="bg-red-50 p-4 rounded overflow-x-auto text-xs text-red-800">
                      {selectedOperation.error}
                    </pre>
                  </div>
                )}

                {!selectedOperation.requestData && !selectedOperation.responseData && (
                  <div className="text-sm text-gray-500 italic">
                    No debug data available for this operation yet.
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Session Summary */}
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Session Information</h4>
                  {session && (
                    <div className="bg-gray-50 p-4 rounded">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="font-medium">Session ID:</span> {session.sessionId}</div>
                        <div><span className="font-medium">Type:</span> {session.type}</div>
                        <div><span className="font-medium">Action:</span> {session.action}</div>
                        <div><span className="font-medium">Status:</span> {session.status}</div>
                        <div><span className="font-medium">Total Operations:</span> {session.totalCount}</div>
                        <div><span className="font-medium">Success:</span> {session.successCount}</div>
                        <div><span className="font-medium">Failed:</span> {session.failureCount}</div>
                        <div><span className="font-medium">Cancelled:</span> {session.cancelledCount}</div>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  Click on any operation in the table above to view its request/response details.
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
