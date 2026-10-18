import { step } from "../decorator/step";
import DriverManager from "../driver/DriverManager";
import type { TOrientation } from "../types/TOrientation";

// what differs between Android and iOS: the app and browser ids, the keyboard; device state shared by both
export default abstract class BaseDriverHelper {
  abstract hideKeyboard(): Promise<void>;

  protected abstract getAppId(): string;

  protected abstract getBrowserId(): string;

  @step("Restart the app")
  async restartApp() {
    await this.terminateApp();
    await this.driver.activateApp(this.getAppId());
  }

  @step("Close the app")
  async terminateApp() {
    await this.driver.terminateApp(this.getAppId());
  }

  // the default 500ms is not always enough for Chrome on a real device
  @step("Close the browser")
  async closeBrowser() {
    await this.driver.terminateApp(this.getBrowserId(), undefined, { timeout: 5000 });
  }

  // 0 not installed, 1 not running, 2-4 running in the background or in the foreground
  async isBrowserRunning() {
    return (await this.driver.queryAppState(this.getBrowserId())) > 1;
  }

  @step((orientation: TOrientation) => `Rotate the device to ${orientation}`)
  async rotate(orientation: TOrientation) {
    await this.driver.setOrientation(orientation);
  }

  async resetOrientation() {
    await this.rotate("PORTRAIT");
  }

  async getOrientation() {
    return (await this.driver.getOrientation()).toUpperCase() as TOrientation;
  }

  async getWindowSize() {
    return this.driver.getWindowSize();
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
}
