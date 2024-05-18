// content.js
chrome.runtime.onMessage.addListener((message) => {
  console.log("Received message in content script:", message);
  if (message.type === 'download_result') {
    chrome.storage.local.get('latestScanResult', function(data) {
      const updatedData = Object.assign({}, data.latestScanResult, message);
      chrome.storage.local.set({ 'latestScanResult': updatedData }, function() {
        updateUI(updatedData);
      });
    });
  }
});

function updateUI(scanResult) {
  const latestScanFileName = document.getElementById('latestScanFileName');
  const latestScanResult = document.getElementById('latestScanResult');
  const descMain = document.getElementById('desc_main');
  const welcomeMessage = document.getElementById('welcome_message');

  if (latestScanFileName && latestScanResult && descMain && welcomeMessage) {
    latestScanFileName.textContent = `File: ${scanResult.filename}`;
    latestScanResult.textContent = `Status: ${scanResult.result}`;
    descMain.style.display = 'block';
    welcomeMessage.style.display = 'none';
  } else {
    console.error("Elements for displaying scan results not found.");
  }
}
