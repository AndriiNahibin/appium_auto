import { step } from "../decorator/step";
import BaseDriverHelper from "./BaseDriverHelper";

// not verified on a real iOS run yet: needs macOS
export default class IOSHelper extends BaseDriverHelper {
  protected getAppId() {
    return this.getSessionCapability("bundleId");
  }

  protected getBrowserId() {
    return "com.apple.mobilesafari";
  }

  @step("Hide the keyboard")
  async hideKeyboard() {
    if (await this.driver.isKeyboardShown()) {
      // plain hideKeyboard often fails on iOS, so press one of the usual keyboard keys
      await this.driver.execute("mobile: hideKeyboard", { keys: ["Done", "Return"] });
    }
  }

}
