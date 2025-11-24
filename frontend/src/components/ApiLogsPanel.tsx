import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { ApiLogEntry } from '../../../shared/types';

export const ApiLogsPanel: React.FC = () => {
  const [logs, setLogs] = useState<ApiLogEntry[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ApiLogEntry | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'success' | 'error'>('all');
  const [isPolling, setIsPolling] = useState(true);
  const [stats, setStats] = useState({ total: 0, success: 0, error: 0, averageDuration: 0 });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsData = filterStatus === 'all' 
          ? await apiService.getApiLogs() 
          : await apiService.getApiLogs(filterStatus);
        setLogs(logsData);

        const statsData = await apiService.getApiLogStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error fetching logs:', error);
      }
    };

    fetchLogs();

    if (isPolling) {
      const interval = setInterval(fetchLogs, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [filterStatus, isPolling]);

  const handleClearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      try {
        await apiService.clearApiLogs();
        setLogs([]);
        setSelectedLog(null);
        setStats({ total: 0, success: 0, error: 0, averageDuration: 0 });
      } catch (error) {
        console.error('Error clearing logs:', error);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatTimestamp = (timestamp: Date) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'success' ? 'text-green-600' : 'text-red-600';
  };

  const getStatusBadge = (status: string) => {
    return status === 'success' 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-red-100 text-red-800 border-red-200';
  };

  const filteredLogs = logs;

  return (
    <div className="bg-white rounded-lg shadow-medium border border-gray-200">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 transition-colors rounded-t-lg"
      >
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-gray-900">API Request Logs</h3>
          <div className="flex gap-3 text-sm">
            <span className="text-gray-600">
              Total: <span className="font-semibold text-gray-900">{stats.total}</span>
            </span>
            <span className="text-green-600">
              Success: <span className="font-semibold">{stats.success}</span>
            </span>
            <span className="text-red-600">
              Errors: <span className="font-semibold">{stats.error}</span>
            </span>
            <span className="text-blue-600">
              Avg: <span className="font-semibold">{stats.averageDuration}ms</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isExpanded && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsPolling(!isPolling)}
                className={isPolling ? 'btn-warning text-xs' : 'btn-success text-xs'}
              >
                {isPolling ? '⏸ Pause' : '▶ Resume'}
              </button>
              <button
                onClick={handleClearLogs}
                className="btn-danger text-xs"
              >
                🗑️ Clear Logs
              </button>
            </div>
          )}
          <span className="text-gray-500 text-xl">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          {/* Filter Bar */}
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                {(['all', 'success', 'error'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                      filterStatus === status
                        ? 'btn-primary'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-small'
                    }`}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Logs Table */}
          <div className="max-h-96 overflow-y-auto">
            {filteredLogs.length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-500">
                No API logs yet. Logs will appear here when you interact with the API.
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      MCP Tool
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <tr 
                        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedLog?.id === log.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                          {log.toolName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusBadge(log.status)}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {log.duration}ms
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(selectedLog?.id === log.id ? null : log);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedLog?.id === log.id ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Log Details */}
                      {selectedLog?.id === log.id && (
                        <tr>
                          <td colSpan={5} className="px-4 py-4 bg-gray-50">
                            <div className="space-y-4">
                              {/* Error Message */}
                              {log.errorMessage && (
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <h5 className="font-semibold text-red-700">Error Message</h5>
                                    <button
                                      onClick={() => {
                                        // Try to format as JSON, otherwise copy as-is
                                        try {
                                          const match = log.errorMessage.match(/Tool \w+ error:\s*(\{[\s\S]*\})\s*$/);
                                          const jsonText = match ? match[1] : log.errorMessage;
                                          const parsed = JSON.parse(jsonText);
                                          copyToClipboard(JSON.stringify(parsed, null, 2));
                                        } catch (e) {
                                          copyToClipboard(log.errorMessage);
                                        }
                                      }}
                                      className="text-xs px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                                    >
                                      📋 Copy
                                    </button>
                                  </div>
                                  <pre className="bg-red-50 border border-red-200 p-3 rounded overflow-x-auto text-xs font-mono text-red-800 whitespace-pre-wrap">
                                    {(() => {
                                      // Try to format as JSON for display
                                      try {
                                        const match = log.errorMessage.match(/Tool (\w+) error:\s*(\{[\s\S]*\})\s*$/);
                                        if (match) {
                                          const toolName = match[1];
                                          const jsonText = match[2];
                                          const parsed = JSON.parse(jsonText);
                                          return `Tool ${toolName} error:\n\n${JSON.stringify(parsed, null, 2)}`;
                                        }
                                        return log.errorMessage;
                                      } catch (e) {
                                        // Not JSON, display as-is
                                        return log.errorMessage;
                                      }
                                    })()}
                                  </pre>
                                </div>
                              )}

                              {/* Request Data */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-semibold text-gray-700">Request Payload</h5>
                                  <button
                                    onClick={() => copyToClipboard(JSON.stringify(log.requestData, null, 2))}
                                    className="text-xs px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                                <pre className="bg-white border border-gray-200 p-3 rounded overflow-x-auto text-xs font-mono">
                                  {JSON.stringify(log.requestData, null, 2)}
                                </pre>
                              </div>

                              {/* Response Data */}
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-semibold text-gray-700">Response Data</h5>
                                  <button
                                    onClick={() => copyToClipboard(JSON.stringify(log.responseData, null, 2))}
                                    className="text-xs px-3 py-1 bg-white border border-gray-300 hover:bg-gray-100 rounded transition-colors"
                                  >
                                    📋 Copy
                                  </button>
                                </div>
                                <pre className="bg-white border border-gray-200 p-3 rounded overflow-x-auto text-xs font-mono max-h-96">
                                  {JSON.stringify(log.responseData, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

