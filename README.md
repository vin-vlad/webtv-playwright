# WebTV Playwright Automation Framework

A JavaScript-based Playwright test automation framework designed for testing TV web interfaces with remote control-style keyboard navigation.

## Features

- **Page Object Model (POM)**: Clean separation between test logic and page interactions
- **Remote Control Simulation**: Navigate the TV interface using keyboard events (Arrow keys, Enter, Escape)
- **Environment Configuration**: URL and settings managed via `.env` file
- **HTML Reporting**: Built-in Playwright HTML reporter for detailed test results
- **TV-Optimized Viewport**: Default 1920x1080 Full HD resolution

## Project Structure

```
webtv-playwright-automation/
├── config/
│   └── env.js              # Environment configuration helper
├── src/
│   ├── pages/              # Page Object Model classes
│   │   ├── BasePage.js     # Base page with common methods
│   │   ├── HomeScreenPage.js # Home screen page object
│   │   └── index.js        # Page exports
│   ├── components/         # Reusable component objects
│   │   └── index.js        # Component exports
│   └── utils/              # Utility functions
│       ├── remoteControl.js # TV remote control simulator
│       └── index.js        # Utility exports
├── tests/                  # Test specifications
│   ├── home-navigation.spec.js    # Home screen navigation tests
│   └── navigation-edge-cases.spec.js # Edge case tests
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment file
├── playwright.config.js    # Playwright configuration
└── package.json            # Project dependencies and scripts
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
| Play/Pause    | Space        | `remote.playPause()` |
| Home          | Home         | `remote.home()`      |

### Usage Example

```javascript
import { test } from '@playwright/test';
import { HomeScreenPage } from '../src/pages/HomeScreenPage.js';
import { RemoteControl } from '../src/utils/remoteControl.js';

test('navigate to a tile and select it', async ({ page }) => {
  const homePage = new HomeScreenPage(page);
  const remote = new RemoteControl(page);

  await homePage.goto();

  // Navigate right 3 times, then down 2 times
  await remote.moveRight(3);
  await remote.moveDown(2);

  // Select the focused item
  await remote.select();
});
```

### Advanced Navigation

```javascript
// Navigate to a grid position (row 2, column 3)
await remote.navigateToGridPosition(2, 3);

// Execute a sequence of commands
await remote.executeSequence([
  { action: 'moveDown', times: 2 },
  { action: 'moveRight', times: 3 },
  { action: 'select' },
]);

// Hold a key for continuous scroll
await remote.holdKey('DOWN', 500);
```

## Page Object Model

### Creating a New Page Object

1. Create a new file in `src/pages/`:

```javascript
import { BasePage } from './BasePage.js';
import { RemoteControl } from '../utils/remoteControl.js';

export class MyNewPage extends BasePage {
  constructor(page) {
    super(page);
    this.remote = new RemoteControl(page);

    this.selectors = {
      mainContent: '[data-testid="main-content"]',
      menuItem: '.menu-item',
    };
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

### Page Object Best Practices

- Keep selectors in a `selectors` object for easy maintenance
- Use meaningful method names that describe user actions
- Integrate the `RemoteControl` utility for keyboard navigation
- Add JSDoc comments for better IDE support

## Customizing Selectors

The default selectors in `HomeScreenPage.js` use common patterns. Update them to match your application:

```javascript
this.selectors = {
  // Update these to match your app's HTML structure
  focusedItem: '[data-focused="true"], .focused, :focus',
  tile: '[data-testid="tile"], .tile, .card',
  contentRow: '[data-testid="content-row"], .row, .carousel',
};
```

## Troubleshooting

### Tests fail to find elements

- Verify your selectors match the actual HTML structure
- Check that the app is running at the URL specified in `.env`
- Use `test:headed` or `test:debug` mode to see what's happening

### Navigation doesn't work

- Ensure the app responds to keyboard events
- Check that focusable elements are in the tab order
- Verify the app doesn't require mouse click to activate keyboard nav

### Reports not generating

- Check the `playwright-report/` directory exists after running tests
- Run `npm run test:report` to open the report
- Ensure tests complete (even with failures) to generate reports

## Contributing

1. Create page objects for new screens in `src/pages/`
2. Add component objects for reusable UI elements in `src/components/`
3. Write tests in the `tests/` directory
4. Update selectors to match the actual application structure

## License

ISC
