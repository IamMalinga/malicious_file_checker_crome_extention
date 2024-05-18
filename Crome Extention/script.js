// script.js
document.addEventListener('DOMContentLoaded', function() {
  const toggleSwitch = document.getElementById('toggleSwitch');
  const extensionStatus = document.getElementById('extensionStatus');
  const icon = document.querySelector('.icon');
  const latestScanFileName = document.getElementById('latestScanFileName');
  const latestScanResult = document.getElementById('latestScanResult');
  const descMain = document.getElementById('desc_main');
  const welcomeMessage = document.getElementById('welcome_message');

  if (!toggleSwitch || !extensionStatus || !icon || !latestScanFileName || !latestScanResult || !descMain || !welcomeMessage) {
    console.error("One or more elements not found in the DOM.");
    return;
  }

  chrome.storage.sync.get('extensionEnabled', function(data) {
    const extensionEnabled = data.extensionEnabled;
    toggleSwitch.checked = extensionEnabled;
    updateExtensionStatus(extensionEnabled);
  });

  toggleSwitch.addEventListener('change', function(event) {
    const extensionEnabled = event.target.checked;
    chrome.storage.sync.set({ 'extensionEnabled': extensionEnabled }, function() {
      updateExtensionStatus(extensionEnabled);
    });
  });

  function updateExtensionStatus(enabled) {
    extensionStatus.textContent = enabled ? 'On' : 'Off';
    icon.style.filter = enabled ? 'none' : 'grayscale(100%)';
  }

  chrome.storage.local.get('latestScanResult', function(data) {
    if (data.latestScanResult) {
      const { filename, result } = data.latestScanResult;
      latestScanFileName.textContent = `File: ${filename}`;
      latestScanResult.textContent = `Status: ${result}`;
      descMain.style.display = 'block';
      welcomeMessage.style.display = 'none';
    } else {
      latestScanFileName.textContent = "No file scanned yet.";
      latestScanResult.textContent = "No results.";
      descMain.style.display = 'none';
      welcomeMessage.style.display = 'block';
    }
  });
});
