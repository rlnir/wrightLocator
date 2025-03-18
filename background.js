// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'copyLocator',
        title: 'Copy Playwright Locator',
        contexts: ['all']
    });
    // Initialize recording state
    chrome.storage.sync.set({ isRecording: false });
});

// Store recording state and actions in memory
let recordedActions = [];
let isRecording = false;

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'copyLocator') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'getLocator'
        });
    }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Background received message:', request);

    switch (request.action) {
        case 'recordedAction':
            // Only store action if recording is active
            if (isRecording) {
                console.log('Recording action:', request.value);
                recordedActions.push(request.value);
                // Forward the action to the popup if it's open
                chrome.runtime.sendMessage({
                    action: 'recordedAction',
                    value: request.value
                }).catch(() => {
                    // Popup is closed, which is expected
                    console.log('Popup is closed, action stored in background');
                });
            }
            break;

        case 'getRecordedActions':
            // Send stored actions to popup
            sendResponse({ actions: recordedActions });
            break;

        case 'clearRecordedActions':
            recordedActions = [];
            break;

        case 'toggleRecording':
            isRecording = request.value;
            console.log('Recording state changed in background:', isRecording);
            // Store state in storage
            chrome.storage.sync.set({ isRecording });
            // Notify all tabs with retries
            chrome.tabs.query({}, function (tabs) {
                tabs.forEach(tab => {
                    const sendWithRetry = (retries = 3) => {
                        chrome.tabs.sendMessage(tab.id, {
                            action: 'toggleRecording',
                            value: isRecording
                        }).catch(error => {
                            if (retries > 0) {
                                setTimeout(() => sendWithRetry(retries - 1), 300);
                            }
                        });
                    };
                    sendWithRetry();
                });
            });
            break;

        case 'getRecordingState':
            sendResponse({ isRecording });
            break;

        case 'copyToClipboard':
            // Handle clipboard operations from content script
            if (request.text) {
                try {
                    navigator.clipboard.writeText(request.text).then(() => {
                        sendResponse({ success: true });
                    }).catch(error => {
                        console.error('Clipboard write failed:', error);
                        sendResponse({ success: false });
                    });
                    return true; // Will respond asynchronously
                } catch (error) {
                    console.error('Clipboard error:', error);
                    sendResponse({ success: false });
                }
            }
            break;
    }

    return true; // Keep the message channel open for async responses
}); 