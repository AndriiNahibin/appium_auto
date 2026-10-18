import { remote } from "webdriverio";
import { env } from "../config/env";
import CapabilitiesHelper from "../helper/CapabilitiesHelper";
import type { IDriverProvider } from "../interface/IDriverProvider";

export default class LocalAppiumProvider implements IDriverProvider {
  async createDriver() {
    return remote({
      hostname: env.APPIUM_HOST,
      port: env.APPIUM_PORT,
      path: "/",
      logLevel: env.WDIO_LOG_LEVEL,
      waitforTimeout: 15000,
      connectionRetryCount: 1,
      capabilities: CapabilitiesHelper.getCapabilities(),
    });
  }

  getDeviceName() {
    return env.DEVICE_NAME ?? "local device";
  }
}
