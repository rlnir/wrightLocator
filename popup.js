document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleLocator');
    const testIdInput = document.getElementById('testIdAttr');

    // Load saved settings
    chrome.storage.sync.get({
        isActive: false,
        testIdAttr: 'data-testid'
    }, function (settings) {
        toggleButton.checked = settings.isActive;
        testIdInput.value = settings.testIdAttr;

        // Send initial state to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'initialize',
                    settings: settings
                });
            }
        });
    });

    // Get current tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0];

        // Send message to content script to toggle the locator
        toggleButton.addEventListener('change', function () {
            const isActive = toggleButton.checked;
            chrome.storage.sync.set({ isActive });
            chrome.tabs.sendMessage(tab.id, {
                action: 'toggle',
                value: isActive
            });
        });

        // Handle test ID attribute changes
        // Use 'input' event instead of 'change' for immediate updates
        testIdInput.addEventListener('input', function () {
            const testIdAttr = testIdInput.value.trim();
            if (testIdAttr) { // Only save if not empty
                chrome.storage.sync.set({ testIdAttr });
                chrome.tabs.sendMessage(tab.id, {
                    action: 'updateTestIdAttr',
                    value: testIdAttr
                });
            }
        });
    });
}); 