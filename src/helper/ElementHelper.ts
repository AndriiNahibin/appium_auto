import { env } from "../config/env";
import { step } from "../decorator/step";
import DriverManager from "../driver/DriverManager";
import type { TLocator } from "../types/TLocator";

// finding, waiting for and acting on elements; actions are Allure steps, queries are not (too noisy)
export default class ElementHelper {
  static getSelector(locator: TLocator) {
    return typeof locator === "string" ? locator : locator[env.PLATFORM];
  }

  static byText(text: string): TLocator {
    return {
      android: `android=new UiSelector().text("${text}")`,
      ios: `-ios predicate string:label == "${text}"`,
    };
  }

  static async waitForDisplayed(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForDisplayed({ timeout: ms });
  }

  // for elements that are removed, not hidden: checking visibility of a removed element hangs in UiAutomator2
  static async waitForNotExisting(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForExist({ timeout: ms, reverse: true });
  }

  static async isVisible(locator: TLocator) {
    return this.getElement(locator).isDisplayed();
  }

  @step((locator: TLocator) => `Tap '${ElementHelper.getSelector(locator)}'`)
  static async tap(locator: TLocator) {
    await this.waitForDisplayed(locator);
    await this.getElement(locator).click();
  }

  // the text is not in the step title: it can be a password
  @step((locator: TLocator) => `Type into '${ElementHelper.getSelector(locator)}'`)
  static async type(locator: TLocator, text: string) {
    await this.waitForDisplayed(locator);
    await this.getElement(locator).setValue(text);
  }

  static async getText(locator: TLocator) {
    await this.waitForDisplayed(locator);
    return this.getElement(locator).getText();
  }

  static async getRect(locator: TLocator) {
    await this.waitForDisplayed(locator);
    const element = this.getElement(locator);
    return { ...await element.getLocation(), ...await element.getSize() };
  }

  static async getElements(locator: TLocator) {
    return DriverManager.get().$$(this.getSelector(locator)).getElements();
  }

  // undefined when the child is not on screen, e.g. cut off at the bottom of a list
  static async getChildText(parent: WebdriverIO.Element, child: TLocator) {
    const element = parent.$(this.getSelector(child));
    if (!(await element.isDisplayed())) {
      return undefined;
    }
    return element.getText();
  }

  private static getElement(locator: TLocator) {
    return DriverManager.get().$(this.getSelector(locator));
  }
}
