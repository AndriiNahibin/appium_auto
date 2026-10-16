import type { IDriverProvider } from "../interface/IDriverProvider";
import LocalAppiumProvider from "./LocalAppiumProvider";

export default class DriverManager {
  private static driver?: WebdriverIO.Browser;

  static async start(provider: IDriverProvider = new LocalAppiumProvider()) {
    if (!this.driver) {
      this.driver = await provider.createDriver();
    }
    return this.driver;
  }

  static get() {
    if (!this.driver) {
      throw new Error("Driver is not started, call DriverManager.start() first");
    }
    return this.driver;
  }

  static async stop() {
    if (!this.driver) {
      return;
    }
    const { driver } = this;
    this.driver = undefined;
    await driver.deleteSession();
  }
}
