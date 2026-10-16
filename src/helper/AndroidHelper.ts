import BaseDriverHelper from "./BaseDriverHelper";

export default class AndroidHelper extends BaseDriverHelper {
  async back() {
    await this.driver.back();
  }

  async hideKeyboard() {
    if (await this.driver.isKeyboardShown()) {
      await this.driver.hideKeyboard();
    }
  }
}
