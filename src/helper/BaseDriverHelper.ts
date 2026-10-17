import { step } from "../decorator/step";
import DriverManager from "../driver/DriverManager";

// what differs between Android and iOS: the app id and the keyboard
export default abstract class BaseDriverHelper {
  abstract hideKeyboard(): Promise<void>;

  protected abstract getAppId(): string;

  @step("Restart the app")
  async restartApp() {
    await this.terminateApp();
    await this.driver.activateApp(this.getAppId());
  }

  @step("Close the app")
  async terminateApp() {
    await this.driver.terminateApp(this.getAppId());
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
