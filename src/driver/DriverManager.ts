import type { IDriverProvider } from "../interface/IDriverProvider";
import DriverProviderFactory from "./DriverProviderFactory";

export default class DriverManager {
  private static driver?: WebdriverIO.Browser;

  private static provider?: IDriverProvider;

  static async start(provider: IDriverProvider = DriverProviderFactory.create()) {
    if (!this.driver) {
      this.driver = await provider.createDriver();
      this.provider = provider;
    }
    return this.driver;
  }

  static isStarted() {
    return Boolean(this.driver);
  }

  static get() {
    if (!this.driver) {
      throw new Error("Driver is not started, call DriverManager.start() first");
    }
    return this.driver;
  }

  static async markSession(passed: boolean, reason: string) {
    if (this.driver) {
      await this.provider?.markSession?.(this.driver, passed, reason);
    }
  }

  static async stop() {
    if (!this.driver) {
      return;
    }
    const { driver } = this;
    this.driver = undefined;
    this.provider = undefined;
    await driver.deleteSession();
  }
}
