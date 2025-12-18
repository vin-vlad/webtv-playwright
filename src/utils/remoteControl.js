import { TIMEOUTS } from './constants.js';

/**
 * RemoteControl - Simulates TV remote control navigation using keyboard events.
 * Maps remote control buttons to keyboard keys for navigating the TV web interface.
 */
export class RemoteControl {
  /**
   * Creates an instance of RemoteControl.
   * @param {import('@playwright/test').Page} page - Playwright page instance
   */
  constructor(page) {
    this.page = page;

    this.keyPressDelay = TIMEOUTS.KEY_PRESS_DELAY;

    this.keys = {
      UP: 'ArrowUp',
      DOWN: 'ArrowDown',
      LEFT: 'ArrowLeft',
      RIGHT: 'ArrowRight',
      SELECT: 'Enter',
      BACK: 'Escape',
    };
  }

  /**
   * Press a single key.
   * Note: The waitForTimeout here is intentional to simulate realistic remote control
   * key press timing. This is necessary for TV interfaces that may have animations
   * or focus transitions between key presses.
   * @param {string} key - Key to press
   * @private
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
    if (this.keyPressDelay > 0) {
      await this.page.waitForTimeout(this.keyPressDelay);
    }
  }

  /**
   * Press a key multiple times.
   * @param {string} key - Key to press
   * @param {number} times - Number of times to press
   * @private
   */
  async pressKeyMultiple(key, times) {
    for (let i = 0; i < times; i++) {
      await this.pressKey(key);
    }
  }

  /**
   * Move focus up.
   * @param {number} [times=1] - Number of times to move up
   */
  async moveUp(times = 1) {
    await this.pressKeyMultiple(this.keys.UP, times);
  }

  /**
   * Move focus down.
   * @param {number} [times=1] - Number of times to move down
   */
  async moveDown(times = 1) {
    await this.pressKeyMultiple(this.keys.DOWN, times);
  }

  /**
   * Move focus left.
   * @param {number} [times=1] - Number of times to move left
   */
  async moveLeft(times = 1) {
    await this.pressKeyMultiple(this.keys.LEFT, times);
  }

  /**
   * Move focus right.
   * @param {number} [times=1] - Number of times to move right
   */
  async moveRight(times = 1) {
    await this.pressKeyMultiple(this.keys.RIGHT, times);
  }

  /**
   * Select/confirm the currently focused item (OK button).
   */
  async select() {
    await this.pressKey(this.keys.SELECT);
  }

  /**
   * Hold the OK/Enter button down for a specified duration.
   * Note: The waitForTimeout here is intentional - it represents the actual
   * duration the button is being held down, which is a physical simulation
   * requirement for long-press detection in TV interfaces.
   * @param {number} duration - Duration in milliseconds to hold the button
   */
  async holdSelect(duration) {
    await this.page.keyboard.down(this.keys.SELECT);
    await this.page.waitForTimeout(duration);
    await this.page.keyboard.up(this.keys.SELECT);
  }

  /**
   * Go back to the previous screen.
   */
  async back() {
    await this.pressKey(this.keys.BACK);
  }
}

export default RemoteControl;
