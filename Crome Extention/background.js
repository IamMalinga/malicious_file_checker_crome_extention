chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [],
    addRules: []
  });
});

chrome.downloads.onDeterminingFilename.addListener((item, suggest) => {
  chrome.storage.sync.get('extensionEnabled', function (data) {
    if (data.extensionEnabled) {
      chrome.action.setBadgeText({ text: "⌛" });

      fetch(item.finalUrl)
        .then(response => response.blob())
        .then(blob => {
          const formData = new FormData();
          formData.append('file', blob, item.filename);

          return fetch('http://localhost:5000/scan', {
            method: 'POST',
            body: formData,
          });
        })
        .then(scanResponse => scanResponse.json())
        .then(scanResult => {
          console.log("Server response:", scanResult);

          if (scanResult.result === 'malicious') {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'Malicious File Blocker',
              message: 'Download aborted: Malicious file detected.',
            });
            updateExtensionUI(item.filename, "Blocked");

            // Cancel the download immediately
            chrome.downloads.cancel(item.id, () => {
              console.log(`Download canceled for file: ${item.filename}`);
              // Attempt to remove the file if it was already partially downloaded
              chrome.downloads.removeFile(item.id, () => {
                if (chrome.runtime.lastError) {
                  console.error("Error removing file:", chrome.runtime.lastError.message);
                } else {
                  console.log(`File removed: ${item.filename}`);
                }
              });
            });
          } else {
            chrome.notifications.create({
              type: 'basic',
              iconUrl: 'icons/icon128.png',
              title: 'Malicious File Blocker',
              message: 'Download allowed: File is safe.',
            });
            updateExtensionUI(item.filename, "Allowed");
            suggest({ filename: item.filename });
          }
        })
        .catch(error => {
          console.error("Error processing file scan:", error);
          chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Malicious File Blocker',
            message: 'Error processing file scan.',
          });
          updateExtensionUI(item.filename, "Error");
          suggest({ filename: item.filename });
        });
    } else {
      suggest({ filename: item.filename });
    }
  });
});

function updateExtensionUI(filename, result) {
  const badgeText = result === 'Allowed' ? '✅' : result === 'Blocked' ? '❌' : '⚠️';
  chrome.action.setBadgeText({ text: badgeText });

  chrome.storage.local.set({ latestScanResult: { filename, result } });

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: 'download_result',
        filename: filename,
        result: result
      }, function (response) {
        if (chrome.runtime.lastError) {
          console.error("Could not send message to content script: ", chrome.runtime.lastError.message);
        }
      });
    }
  });

  console.log(`UI updated for file: ${filename} with result: ${result}`);
}
