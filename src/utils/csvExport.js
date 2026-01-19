// CSV Export Utilities

/**
 * Convert JSON array to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional array of header names
 * @returns {string} CSV formatted string
 */
export function jsonToCSV(data, headers = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get headers from first object if not provided
  const csvHeaders = headers || Object.keys(data[0]);
  
  // Create header row
  const headerRow = csvHeaders.map(escapeCSVValue).join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return csvHeaders.map(header => {
      const value = row[header];
      return escapeCSVValue(formatValue(value));
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Escape special characters in CSV values
 * @param {*} value - Value to escape
 * @returns {string} Escaped value
 */
function escapeCSVValue(value) {
  if (value == null) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
}

/**
 * Format value for CSV export
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 */
function formatValue(value) {
  if (value == null) {
    return '';
  }
  
  // Format dates
  if (value instanceof Date) {
    return value.toISOString();
  }
  
  // Format objects and arrays
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  
  return value;
}

/**
 * Download CSV file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Filename for download
 */
export function downloadCSV(csvContent, filename = 'export.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format audit logs for CSV export
 * @param {Array} logs - Array of audit log objects
 * @returns {string} CSV formatted string
 */
export function formatAuditLogsForCSV(logs) {
  const formattedLogs = logs.map(log => ({
    Timestamp: log.timestamp ? new Date(log.timestamp).toLocaleString() : '',
    Action: log.action || '',
    Resource: log.resource || '',
    'Resource ID': log.resourceId || '',
    User: log.user || log.userId || '',
    Details: log.details ? JSON.stringify(log.details) : '',
    Source: log.source || 'server',
  }));
  
  return jsonToCSV(formattedLogs);
}

/**
 * Export audit logs to CSV file
 * @param {Array} logs - Array of audit log objects
 * @param {string} filename - Optional custom filename
 */
export function exportAuditLogsToCSV(logs, filename = null) {
  const csvContent = formatAuditLogsForCSV(logs);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const defaultFilename = `audit-logs-${timestamp}.csv`;
  downloadCSV(csvContent, filename || defaultFilename);
}
