import { env } from "../config/env";
import DriverManager from "../driver/DriverManager";
import type { TLocator } from "../types/TLocator";
import type { TPoint } from "../types/TPoint";

export default abstract class BaseDriverHelper {
  abstract back(): Promise<void>;

  abstract hideKeyboard(): Promise<void>;

  protected abstract getAppId(): string;

  async restartApp() {
    const appId = this.getAppId();
    await this.driver.terminateApp(appId);
    await this.driver.activateApp(appId);
  }

  getSelector(locator: TLocator) {
    return typeof locator === "string" ? locator : locator[env.PLATFORM];
  }

  async waitForDisplayed(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForDisplayed({ timeout: ms });
  }

  async waitForNotDisplayed(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForDisplayed({ timeout: ms, reverse: true });
  }

  // for elements that are removed, not hidden: checking visibility of a removed element hangs in UiAutomator2
  async waitForNotExisting(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForExist({ timeout: ms, reverse: true });
  }

  async isVisible(locator: TLocator) {
    return this.getElement(locator).isDisplayed();
  }

  async tap(locator: TLocator) {
    await this.waitForDisplayed(locator);
    await this.getElement(locator).click();
  }

  async type(locator: TLocator, text: string) {
    await this.waitForDisplayed(locator);
    await this.getElement(locator).setValue(text);
  }

  async getText(locator: TLocator) {
    await this.waitForDisplayed(locator);
    return this.getElement(locator).getText();
  }

  async getElements(locator: TLocator) {
    return this.driver.$$(this.getSelector(locator)).getElements();
  }

  // undefined when the child is not on screen, e.g. cut off at the bottom of a list
  async getChildText(parent: WebdriverIO.Element, child: TLocator) {
    const element = parent.$(this.getSelector(child));
    if (!(await element.isDisplayed())) {
      return undefined;
    }
    return element.getText();
  }

  async swipeUp(percent = 0.5) {
    await this.driver.swipe({ direction: "up", percent });
  }

  async getRect(locator: TLocator) {
    await this.waitForDisplayed(locator);
    const element = this.getElement(locator);
    return { ...await element.getLocation(), ...await element.getSize() };
  }

  // points are relative to the element: { x: 0, y: 0 } is its top left corner, { x: 1, y: 1 } is the bottom right one
  async drawInside(locator: TLocator, points: TPoint[]) {
    const { x, y, width, height } = await this.getRect(locator);
    const [first, ...rest] = points.map((point) => ({
      x: Math.round(x + point.x * width),
      y: Math.round(y + point.y * height),
    }));
    if (!first) {
      return;
    }

    const finger = this.driver.action("pointer", { parameters: { pointerType: "touch" } }).move(first).down();
    for (const point of rest) {
      finger.move({ ...point, duration: 300 });
    }
    await finger.up().perform();
  }

  // runs a script inside the first WebView and always returns to the native context
  async executeInWebView(script: string, ms = 10000) {
    let webView: string | undefined;
    await this.driver.waitUntil(async () => {
      const contexts = await this.driver.getContexts();
      webView = contexts.map(String).find((context) => context.startsWith("WEBVIEW"));
      return Boolean(webView);
    }, { timeout: ms, timeoutMsg: `No WebView context after ${ms}ms` });

    await this.driver.switchContext(webView as string);
    try {
      return await this.driver.execute(script);
    }
    finally {
      await this.driver.switchContext("NATIVE_APP");
    }
  }

  byText(text: string): TLocator {
    return {
      android: `android=new UiSelector().text("${text}")`,
      ios: `-ios predicate string:label == "${text}"`,
    };
  }

  protected get driver() {
    return DriverManager.get();
  }

  // capabilities returned by Appium for the started session, without the "appium:" prefix
  protected getSessionCapability(name: string) {
    const value = (this.driver.capabilities as Record<string, unknown>)[name];
    if (typeof value !== "string") {
      throw new Error(`Session has no '${name}' capability`);
    }
    return value;
  }

  protected getElement(locator: TLocator) {
    return this.driver.$(this.getSelector(locator));
  }
}
