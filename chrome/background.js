// Simple background script to coordinate between tabs
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'checkForCSVData') {
    // Send the stored CSV data if available
    chrome.storage.local.get(['csvData', 'csvFileName', 'targetTool'], function(data) {
      if (data.csvData && data.targetTool === message.toolPage) {
        sendResponse({ 
          status: 'success',
          csvData: data.csvData,
          fileName: data.csvFileName
        });
        // Clear the data after sending
        chrome.storage.local.remove(['csvData', 'csvFileName', 'targetTool']);
      } else {
        sendResponse({ status: 'nodata' });
      }
    });
    return true; // Required for async response
  }
});