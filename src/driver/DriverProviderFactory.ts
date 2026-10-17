import { env } from "../config/env";
import type { IDriverProvider } from "../interface/IDriverProvider";
import BrowserStackProvider from "./BrowserStackProvider";
import LocalAppiumProvider from "./LocalAppiumProvider";

export default class DriverProviderFactory {
  static create(): IDriverProvider {
    return env.DRIVER_PROVIDER === "browserstack" ? new BrowserStackProvider() : new LocalAppiumProvider();
  }
}
