# wrightLocator

A Chrome extension that helps you generate Playwright locators by hovering over elements on a webpage.

## Features

- Shows Playwright locators for any element you hover over
- Highlights the currently selected element
- Generates the most specific and reliable locator available
- Supports various locator types:
  - ID-based locators
  - Test ID locators
  - Aria label locators
  - Text-based locators
  - CSS selectors (as fallback)

## Installation

1. Clone this repository or download the files
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the directory containing these files

## Usage

1. Click the extension icon in your Chrome toolbar
2. Toggle the "Show Locators" switch to enable the locator helper
3. Hover over any element on the webpage to see its Playwright locator
4. The locator will appear above the element and the element will be highlighted
5. Toggle the switch off when you're done
6. Customize the test ID attribute name in the settings if needed

## How it Works

The extension tries to generate the most specific and reliable locator for each element in this order:
1. Test ID locator (using your configured attribute)
2. Role-based locator (if element has a role and name)
3. ID-based locator (if element has an ID)
4. Title-based locator
5. Placeholder-based locator
6. Label-based locator
7. Text-based locator
8. CSS selector (as a fallback)

## Contributing

Feel free to submit issues and enhancement requests! 