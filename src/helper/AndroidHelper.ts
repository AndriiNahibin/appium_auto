import BaseDriverHelper from "./BaseDriverHelper";

export default class AndroidHelper extends BaseDriverHelper {
  protected getAppId() {
    return this.getSessionCapability("appPackage");
  }

  async back() {
    await this.driver.back();
  }

  async hideKeyboard() {
    if (await this.driver.isKeyboardShown()) {
      await this.driver.hideKeyboard();
    }
  }
}
