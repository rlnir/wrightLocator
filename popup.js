document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleLocator');
    const testIdInput = document.getElementById('testIdAttr');
    const recordButton = document.getElementById('recordButton');
    const recordedActions = document.getElementById('recordedActions');
    const actionsList = document.getElementById('actionsList');
    const copyActions = document.getElementById('copyActions');
    const clearActions = document.getElementById('clearActions');
    let isRecording = false;

    // Clear recorded actions
    clearActions.addEventListener('click', function () {
        chrome.runtime.sendMessage({ action: 'clearRecordedActions' }, response => {
            if (response && response.success) {
                actionsList.innerHTML = '';
                recordedActions.style.display = 'none';
            }
        });
    });

    // Get recorded actions from background script
    function loadRecordedActions() {
        chrome.runtime.sendMessage({ action: 'getRecordedActions' }, response => {
            if (response && response.actions) {
                actionsList.innerHTML = '';
                response.actions.forEach(action => {
                    const actionItem = document.createElement('div');
                    actionItem.className = 'action-item';
                    actionItem.textContent = action;
                    actionsList.appendChild(actionItem);
                });
                if (response.actions.length > 0) {
                    recordedActions.style.display = 'block';
                }
            }
        });
    }

    // Get recording state from background script
    function updateRecordingState() {
        chrome.runtime.sendMessage({ action: 'getRecordingState' }, response => {
            if (response) {
                isRecording = response.isRecording;
                recordButton.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
                recordButton.classList.toggle('recording', isRecording);
                if (isRecording) {
                    recordedActions.style.display = 'block';
                }
            }
        });
    }

    // Load saved settings
    chrome.storage.sync.get({
        isActive: false,
        testIdAttr: 'data-testid'
    }, function (settings) {
        console.log('Loaded settings:', settings);
        toggleButton.checked = settings.isActive;
        testIdInput.value = settings.testIdAttr;

        // Get recording state and actions
        updateRecordingState();
        loadRecordedActions();

        // Send initial state to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'initialize',
                    settings: settings
                }, response => {
                    if (chrome.runtime.lastError) {
                        console.error('Error initializing content script:', chrome.runtime.lastError);
                    }
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
        testIdInput.addEventListener('input', function () {
            const testIdAttr = testIdInput.value.trim();
            if (testIdAttr) {
                chrome.storage.sync.set({ testIdAttr });
                chrome.tabs.sendMessage(tab.id, {
                    action: 'updateTestIdAttr',
                    value: testIdAttr
                });
            }
        });

        // Handle recording button clicks
        recordButton.addEventListener('click', function () {
            const newRecordingState = !isRecording;
            console.log('Recording state changed:', newRecordingState);

            // Update UI immediately
            recordButton.textContent = newRecordingState ? 'Stop Recording' : 'Start Recording';
            recordButton.classList.toggle('recording', newRecordingState);
            isRecording = newRecordingState;

            if (newRecordingState) {
                actionsList.innerHTML = '';
                recordedActions.style.display = 'block';
            }

            // Send to background script with confirmation
            chrome.runtime.sendMessage({
                action: 'toggleRecording',
                value: newRecordingState
            }, response => {
                if (chrome.runtime.lastError) {
                    console.error('Error toggling recording:', chrome.runtime.lastError);
                    // Revert UI if failed
                    recordButton.textContent = isRecording ? 'Stop Recording' : 'Start Recording';
                    recordButton.classList.toggle('recording', isRecording);
                    isRecording = !isRecording;
                }
            });
        });

        // Handle copying actions
        copyActions.addEventListener('click', function () {
            const actions = Array.from(actionsList.children)
                .map(item => item.textContent)
                .join('\n');

            console.log('Copying actions:', actions);
            navigator.clipboard.writeText(actions).then(() => {
                copyActions.textContent = 'Copied!';
                setTimeout(() => {
                    copyActions.textContent = 'Copy All Actions';
                }, 2000);
            }).catch(error => {
                console.error('Error copying to clipboard:', error);
                copyActions.textContent = 'Copy Failed';
                setTimeout(() => {
                    copyActions.textContent = 'Copy All Actions';
                }, 2000);
            });
        });
    });

    // Listen for recorded actions from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log('Received message in popup:', request);
        if (request.action === 'recordedAction') {
            console.log('Adding action:', request.value);
            const actionItem = document.createElement('div');
            actionItem.className = 'action-item';
            actionItem.textContent = request.value;
            actionsList.appendChild(actionItem);
            recordedActions.style.display = 'block';
        }
        return true;
    });
}); 