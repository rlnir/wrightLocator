// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'copyLocator',
        title: 'Copy Playwright Locator',
        contexts: ['all']
    });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'copyLocator') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'getLocator'
        });
    }
});

// Handle clipboard operations as a last resort
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'copyToClipboard' && request.text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = request.text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            sendResponse({ success: true });
        } catch (error) {
            console.error('Failed to copy text:', error);
            sendResponse({ success: false });
        }
    }
    return true; // Keep the message channel open for the async response
}); 