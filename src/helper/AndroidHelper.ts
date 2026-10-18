import { step } from "../decorator/step";
import BaseDriverHelper from "./BaseDriverHelper";

export default class AndroidHelper extends BaseDriverHelper {
  protected getAppId() {
    return this.getSessionCapability("appPackage");
  }

  protected getBrowserId() {
    return "com.android.chrome";
  }

  @step("Hide the keyboard")
  async hideKeyboard() {
    if (await this.driver.isKeyboardShown()) {
      await this.driver.hideKeyboard();
    }
  }

}
