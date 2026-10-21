// Background script to coordinate between tabs
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Handle Google Sheets tab closed without showing guidance
  if (message.action === 'googleSheetsClosed') {
    // Clear the flag if the tab was closed without showing guidance
    chrome.storage.local.remove(['showGoogleSheetsGuidance']);
    sendResponse({ status: 'success' });
  }
});