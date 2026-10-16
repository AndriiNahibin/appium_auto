import { env } from "../config/env";
import DriverManager from "../driver/DriverManager";
import type { TLocator } from "../types/TLocator";

export default abstract class BaseDriverHelper {
  abstract back(): Promise<void>;

  abstract hideKeyboard(): Promise<void>;

  getSelector(locator: TLocator) {
    return typeof locator === "string" ? locator : locator[env.PLATFORM];
  }

  async waitForDisplayed(locator: TLocator, ms?: number) {
    await this.getElement(locator).waitForDisplayed({ timeout: ms });
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

  protected get driver() {
    return DriverManager.get();
  }

  protected getElement(locator: TLocator) {
    return this.driver.$(this.getSelector(locator));
  }
}
