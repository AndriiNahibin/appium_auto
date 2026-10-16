import BaseDriverHelper from "./BaseDriverHelper";

// not verified on a real iOS run yet: needs macOS
export default class IOSHelper extends BaseDriverHelper {
  async back() {
    // iOS has no system Back button, so tap the first button in the navigation bar
    await this.tap("-ios class chain:**/XCUIElementTypeNavigationBar/XCUIElementTypeButton[1]");
  }

  async hideKeyboard() {
    if (await this.driver.isKeyboardShown()) {
      // plain hideKeyboard often fails on iOS, so press one of the usual keyboard keys
      await this.driver.execute("mobile: hideKeyboard", { keys: ["Done", "Return"] });
    }
  }
}
