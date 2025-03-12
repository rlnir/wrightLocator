let isActive = false;
let overlay = null;
let testIdAttr = 'data-testid'; // Default test ID attribute
let lastRightClickedElement = null;

// Initialize settings from storage
chrome.storage.sync.get({
    isActive: false,
    testIdAttr: 'data-testid'
}, function (settings) {
    isActive = settings.isActive;
    testIdAttr = settings.testIdAttr;
});

// Store the element on right click
document.addEventListener('contextmenu', function (e) {
    lastRightClickedElement = e.target;
});

function getElementRole(element) {

    // Get explicit role
    const role = element.getAttribute('role');
    if (role) return role;

    // Map common HTML elements to their implicit roles
    const tagToRole = {
        'a': 'link',
        'article': 'article',
        'aside': 'complementary',
        'button': 'button',
        'h1': 'heading',
        'h2': 'heading',
        'h3': 'heading',
        'h4': 'heading',
        'h5': 'heading',
        'h6': 'heading',
        'header': 'banner',
        'footer': 'contentinfo',
        'form': 'form',
        'img': 'img',
        'input': (el) => {
            const type = el.type?.toLowerCase();
            switch (type) {
                case 'button':
                case 'submit':
                case 'reset': return 'button';
                case 'checkbox': return 'checkbox';
                case 'radio': return 'radio';
                case 'range': return 'slider';
                case 'search': return 'searchbox';
                default: return 'textbox';
            }
        },
        'li': 'listitem',
        'nav': 'navigation',
        'ol': 'list',
        'select': 'combobox',
        'table': 'table',
        'textarea': 'textbox',
        'ul': 'list'
    };

    const tagName = element.tagName.toLowerCase();
    const implicitRole = tagToRole[tagName];

    if (implicitRole) {
        return typeof implicitRole === 'function' ? implicitRole(element) : implicitRole;
    }

    return null;
}

function generatePlaywrightLocator(element) {
    // Check for test ID attribute
    const testId = element.getAttribute(testIdAttr);
    if (testId) {
        return `page.getByTestId('${testId}')`;
    }

    // Try to get the most specific and reliable locator
    const role = getElementRole(element);
    const name = element.getAttribute('aria-label') ||
        element.textContent.trim() ||
        element.getAttribute('title') ||
        element.getAttribute('placeholder') ||
        element.getAttribute('alt');

    if (role && name) {
        return `page.getByRole('${role}', { name: '${name}' })`;
    }

    if (element.id) {
        return `page.locator('#${element.id}')`;
    }

    // Add title-based locator
    if (element.getAttribute('title')) {
        return `page.getByTitle('${element.getAttribute('title')}')`;
    }

    // Add placeholder-based locator
    if (element.getAttribute('placeholder')) {
        return `page.getByPlaceholder('${element.getAttribute('placeholder')}')`;
    }

    if (element.getAttribute('aria-label')) {
        return `page.getByLabel('${element.getAttribute('aria-label')}')`;
    }

    if (element.textContent.trim()) {
        return `page.getByText('${element.textContent.trim()}')`;
    }

    // Generate CSS selector as fallback
    let path = [];
    let current = element;

    while (current && current !== document.body) {
        let selector = current.tagName.toLowerCase();
        if (current.className) {
            const classes = Array.from(current.classList).join('.');
            selector += `.${classes}`;
        }
        path.unshift(selector);
        current = current.parentElement;
    }

    return `page.locator('${path.join(' > ')}')`;
}

function createOverlay() {
    const div = document.createElement('div');
    div.className = 'playwright-locator-overlay';
    div.style.display = 'none';
    document.body.appendChild(div);
    return div;
}

function showLocator(event) {
    if (!isActive) return;

    const element = event.target;

    if (!overlay) {
        overlay = createOverlay();
    }

    const locator = generatePlaywrightLocator(element);
    const rect = element.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    overlay.textContent = locator;
    overlay.style.display = 'block';
    overlay.style.top = `${rect.top + scrollTop - 30}px`;
    overlay.style.left = `${rect.left + scrollLeft}px`;

    // Highlight the element
    element.style.outline = '2px solid #ff0000';
    event.stopPropagation();
}

function hideLocator(event) {
    if (!isActive) return;
    event.target.style.outline = '';
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function updateUI() {
    if (!isActive && overlay) {
        overlay.style.display = 'none';
        document.querySelectorAll('*').forEach(el => {
            el.style.outline = '';
        });
    }
}

function copyToClipboard(text) {
    return new Promise((resolve) => {
        // First try using the background script
        chrome.runtime.sendMessage({
            action: 'copyToClipboard',
            text: text
        }, (response) => {
            if (response?.success) {
                resolve(true);
                return;
            }

            // If background script fails, try navigator.clipboard
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text)
                    .then(() => resolve(true))
                    .catch(() => resolve(false));
            } else {
                resolve(false);
            }
        });
    });
}

function showNotification(message, isError = false) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background-color: ${isError ? '#f44336' : '#4CAF50'};
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 2000);
}

// Listen for messages from the popup and background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch (request.action) {
        case 'initialize':
            isActive = request.settings.isActive;
            testIdAttr = request.settings.testIdAttr;
            updateUI();
            break;
        case 'toggle':
            isActive = request.value;
            updateUI();
            break;
        case 'updateTestIdAttr':
            if (request.value) {
                testIdAttr = request.value;
            }
            break;
        case 'getLocator':
            if (lastRightClickedElement) {
                const locator = generatePlaywrightLocator(lastRightClickedElement);
                copyToClipboard(locator).then(success => {
                    if (success) {
                        showNotification('Locator copied to clipboard!');
                    } else {
                        showNotification('Failed to copy locator to clipboard', true);
                    }
                });
            }
            break;
    }
});

// Add event listeners
document.addEventListener('mouseover', showLocator);
document.addEventListener('mouseout', hideLocator); 