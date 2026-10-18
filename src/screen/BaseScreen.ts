import DriverHelperFactory from "../helper/DriverHelperFactory";
import ElementHelper from "../helper/ElementHelper";
import type { TLocator } from "../types/TLocator";

export default abstract class BaseScreen {
  protected requiredElements: TLocator[] = [];

  protected get device() {
    return DriverHelperFactory.get();
  }

  async shouldBeOpen(ms = 10000) {
    // allSettled, not all: report every missing element, not only the first one
    const results = await Promise.allSettled(
      this.requiredElements.map((locator) => ElementHelper.waitForDisplayed(locator, ms))
    );
    const missing = this.requiredElements.filter((_, index) => results[index]?.status === "rejected");
    if (missing.length) {
      const selectors = missing.map((locator) => `'${ElementHelper.getSelector(locator)}'`).join(", ");
      throw new Error(`${this.constructor.name} should be open, but not displayed after ${ms}ms: ${selectors}`);
    }
  }
}
