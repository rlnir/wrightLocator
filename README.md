# wrightLocator

A Chrome extension that helps you generate Playwright locators by hovering over elements on a webpage.

## Features

- Shows Playwright locators for any element you hover over
- Highlights the currently selected element
- Right-click context menu to copy locators directly
- Generates the most specific and reliable locator available
- Records user actions and generates Playwright test code
- Supports various locator types in order of reliability:
  1. Test ID locators (using your configured attribute)
  2. Name attribute locators
  3. Class attribute locators
  4. Role-based locators with ARIA attributes
  5. ID-based locators
  6. Title-based locators
  7. Placeholder-based locators
  8. Label-based locators
  9. Text-based locators
  10. CSS selectors (as fallback)

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

### Recording Actions
1. Click the extension icon in your Chrome toolbar
2. Click the "Start Recording" button to begin recording
3. Perform your actions on the webpage:
   - Clicks are recorded as `click()` actions
   - Text input is recorded as `fill()` actions
   - Select dropdowns are recorded as `selectOption()` actions
   - Checkboxes are recorded as `check()` or `uncheck()` actions
4. Click "Stop Recording" when you're done
5. Use the "Copy All Actions" button to copy the generated Playwright test code
6. The recorded actions will be preserved even if you close the popup

### Customization
- Customize the test ID attribute name in the settings if needed (default is 'data-testid')

## How it Works

The extension generates locators in order of reliability and specificity:

1. Test ID locator (using your configured attribute)
   - Most reliable as it's specifically designed for testing
   - Example: `page.getByTestId('submit-button')`

2. Name attribute locator
   - Reliable for form elements and inputs
   - Example: `page.locator('[name="username"]')`

3. Class attribute locator
   - Uses single class for simplicity and reliability
   - Example: `page.locator('.submit-button')`

4. Role-based locator (using ARIA roles and accessible names)
   - Supports both explicit roles (via role attribute)
   - Handles implicit roles for common HTML elements
   - Example: `page.getByRole('button', { name: 'Submit' })`

5. ID-based locator
   - Simple and reliable when IDs are available
   - Example: `page.locator('#submit-button')`

6. Title-based locator
   - Uses element's title attribute
   - Example: `page.getByTitle('Submit form')`

7. Placeholder-based locator
   - Uses input placeholder text
   - Example: `page.getByPlaceholder('Enter username')`

8. Label-based locator
   - Uses aria-label or associated label text
   - Example: `page.getByLabel('Username')`

9. Text-based locator
   - Uses element's text content
   - Example: `page.getByText('Submit')`

10. CSS selector (as fallback)
    - Generates a CSS selector path to the element
    - Example: `page.locator('form > button.submit-button')`

## Contributing

Feel free to submit issues and enhancement requests! 