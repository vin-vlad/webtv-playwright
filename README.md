# WebTV Playwright Automation Framework

A JavaScript-based Playwright test automation framework designed for testing TV web interfaces with remote control-style keyboard navigation.

## Features

- **Page Object Model (POM)**: Clean separation between test logic and page interactions
- **Remote Control Simulation**: Navigate the TV interface using keyboard events (Arrow keys, Enter, Escape)
- **NavigationBar Component**: Reusable navigation bar component with shared menu navigation logic
- **Environment Configuration**: URL and settings managed via `.env` file
- **HTML Reporting**: Built-in Playwright HTML reporter for detailed test results
- **TV-Optimized Viewport**: Default 1920x1080 Full HD resolution

## Project Structure

```
webtv-playwright-automation/
├── config/
│   └── env.js                  # Environment configuration helper
├── src/
│   ├── pages/                  # Page Object Model classes
│   │   ├── BasePage.js         # Base page with common methods
│   │   ├── HomeScreenPage.js   # Home screen page object
│   │   ├── SearchPage.js       # Search page object
│   │   └── index.js            # Page exports
│   ├── components/             # Reusable component objects
│   │   ├── NavigationBar.js    # Navigation bar component with menu navigation
│   │   └── index.js            # Component exports
│   └── utils/                  # Utility functions
│       ├── remoteControl.js    # TV remote control simulator
│       ├── navigationHelpers.js # Navigation utility functions
│       ├── constants.js        # Timeout and limit constants
│       └── index.js            # Utility exports
├── tests/                      # Test specifications
│   ├── channels-page.spec.js   # Channels page video playback tests
│   ├── favourites-rail.spec.js # Favourite Apps rail management tests
│   └── search-page.spec.js     # Search page category tests
├── .env                        # Environment variables (not in git)
├── .env.example                # Example environment file
├── playwright.config.js        # Playwright configuration
└── package.json                # Project dependencies and scripts
```

## Installation

1. Clone the repository and navigate to the project directory:

```bash
cd webtv-playwright-automation
```

2. Install dependencies:

```bash
npm install
```

3. Install Playwright browsers:

```bash
npx playwright install
```

4. Configure the application URL:

```bash
cp .env.example .env
# Edit .env and set APP_URL to your TV web application URL
```

## Configuration

### Environment Variables

Create a `.env` file in the project root with:

```env
# URL of the TV web application to test
APP_URL=http://localhost:3000
```

### Playwright Configuration

The `playwright.config.js` file contains:

- **Base URL**: Loaded from `APP_URL` environment variable
- **Viewport**: 1920x1080 (Full HD TV resolution)
- **Reporter**: HTML reporter with screenshots and traces on failure
- **Browser**: Chromium by default (Firefox/WebKit available)

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode (interactive)
npm run test:ui

# Run tests in headed browser (visible)
npm run test:headed

# Run tests in debug mode
npm run test:debug

# Run tests with trace recording
npm run test:trace
```

### Browser-Specific

```bash
# Run on Chromium only
npm run test:chromium

# Run on Firefox only
npm run test:firefox

# Run on WebKit only
npm run test:webkit
```

### Reporting

```bash
# Open the HTML report after tests complete
npm run test:report

# Or explicitly open the report directory
npm run report:open
```

### Cleanup

```bash
# Remove test results and reports
npm run clean
```

## Remote Control Navigation

The framework simulates TV remote control buttons using keyboard events.

### Key Mappings

| Remote Button | Keyboard Key | Method               |
| ------------- | ------------ | -------------------- |
| Up            | ArrowUp      | `remote.moveUp()`    |
| Down          | ArrowDown    | `remote.moveDown()`  |
| Left          | ArrowLeft    | `remote.moveLeft()`  |
| Right         | ArrowRight   | `remote.moveRight()` |
| OK/Select     | Enter        | `remote.select()`    |
| Back          | Escape       | `remote.back()`      |

### Usage Example

```javascript
import { test } from '@playwright/test';
import { HomeScreenPage } from '../src/pages/HomeScreenPage.js';

test('navigate to a tile and select it', async ({ page }) => {
  const homePage = new HomeScreenPage(page);

  await homePage.goto();

  // Navigate right 3 times, then down 2 times
  await homePage.remote.moveRight(3);
  await homePage.remote.moveDown(2);

  // Select the focused item
  await homePage.remote.select();
});
```

### Long Press Actions

```javascript
// Hold the select button for a long press action (e.g., open edit mode)
await homePage.remote.holdSelect(1500); // Hold for 1.5 seconds
```

## NavigationBar Component

The `NavigationBar` component provides reusable locators and navigation methods for the main menu.

### Menu Items

The navigation bar includes locators for all main menu items:

- `searchItem` - Search menu item
- `homeItem` - Home menu item
- `tvGuideItem` - TV Guide menu item
- `channelsItem` - Channels menu item
- `gamingItem` - Gaming menu item
- `freeItem` - Free menu item
- `appsItem` - Apps menu item

### Shared Menu Navigation

Use `navigateToMenuItemByName()` to navigate to any menu item from the home screen:

```javascript
import { NavigationBar } from '../src/components/NavigationBar.js';
import { RemoteControl } from '../src/utils/remoteControl.js';

// Navigate to the Apps menu item
const nav = new NavigationBar(page);
const remote = new RemoteControl(page);

await nav.navigateToMenuItemByName(remote, 'Apps');
await remote.select();
```

## Page Object Model

### Available Page Objects

- **BasePage**: Base class with common methods (`goto()`, `waitForPageLoad()`)
- **HomeScreenPage**: Home screen with favourite apps rail, menu navigation, and app management
- **SearchPage**: Search page with category selection and results grid

### Creating a New Page Object

1. Create a new file in `src/pages/`:

```javascript
import { BasePage } from './BasePage.js';
import { RemoteControl } from '../utils/remoteControl.js';
import { NavigationBar } from '../components/NavigationBar.js';

export class MyNewPage extends BasePage {
  constructor(page) {
    super(page);
    this.remote = new RemoteControl(page);
    this.nav = new NavigationBar(page);
  }

  async navigateToSection(sectionName) {
    // Custom navigation logic
  }
}
```

2. Export from `src/pages/index.js`:

```javascript
export { MyNewPage } from './MyNewPage.js';
```

## Navigation Helpers

The `navigationHelpers.js` module provides utility functions for navigation:

- **`normalise(value)`**: Normalize strings for comparison (lowercase, trim)
- **`waitForFocusChange(page, getValueFn, previousValue, timeout)`**: Poll for focus changes
- **`logNavigationFailure(context, target, lastFocused)`**: Log navigation failures
- **`createTestIdFocusGetter(containerLocator)`**: Create a function to get focused element's data-testid
- **`createTextFocusGetter(containerLocator)`**: Create a function to get focused element's text content

## Constants

Centralized timeout and navigation limit values are defined in `constants.js`:

### Timeouts

| Constant           | Value    | Description                           |
| ------------------ | -------- | ------------------------------------- |
| `DEFAULT`          | 10000ms  | Default timeout for general operations |
| `ELEMENT_VISIBILITY` | 15000ms | Timeout for element visibility checks |
| `NETWORK_IDLE`     | 5000ms   | Timeout for network idle state        |
| `LONG_PRESS_DURATION` | 1500ms | Duration for long press actions      |
| `FOCUS_CHANGE`     | 500ms    | Timeout for detecting focus changes   |
| `KEY_PRESS_DELAY`  | 100ms    | Delay between key presses             |

### Navigation Limits

| Constant              | Value | Description                              |
| --------------------- | ----- | ---------------------------------------- |
| `MAX_MENU_STEPS`      | 10    | Maximum steps for menu navigation        |
| `MAX_RAIL_STEPS`      | 50    | Maximum steps for rail/list navigation   |
| `MAX_APP_SEARCH_STEPS` | 100   | Maximum steps when searching for an app |
| `MAX_DOWN_STEPS`      | 15    | Maximum down presses when looking for rail |


