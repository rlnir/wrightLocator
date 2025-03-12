# wrightLocator

A Chrome extension that helps you generate Playwright locators by hovering over elements on a webpage.

## Features

- Shows Playwright locators for any element you hover over
- Highlights the currently selected element
- Right-click context menu to copy locators directly
- Generates the most specific and reliable locator available
- Supports various locator types:
  - ID-based locators
  - Test ID locators
  - Role-based locators with ARIA attributes
  - Title-based locators
  - Placeholder-based locators
  - Label-based locators
  - Text-based locators
  - CSS selectors (as fallback)

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

### Basic Usage
1. Click the extension icon in your Chrome toolbar
2. Toggle the "Show Locators" switch to enable the locator helper
3. Hover over any element on the webpage to see its Playwright locator
4. The locator will appear above the element and the element will be highlighted
5. Toggle the switch off when you're done

### Quick Copy Feature
1. Right-click any element on the page
2. Select "Copy Playwright Locator" from the context menu
3. The locator will be automatically copied to your clipboard
4. A notification will confirm the successful copy

### Customization
- Customize the test ID attribute name in the settings if needed (default is 'data-testid')

## How it Works

The extension generates locators in order of reliability and specificity:

1. Test ID locator (using your configured attribute)
2. Role-based locator (using ARIA roles and accessible names)
   - Supports both explicit roles (via role attribute)
   - Handles implicit roles for common HTML elements
3. ID-based locator (if element has an ID)
4. Title-based locator
5. Placeholder-based locator
6. Label-based locator (using aria-label)
7. Text-based locator
8. CSS selector (as a fallback)

## Contributing

Feel free to submit issues and enhancement requests! 
