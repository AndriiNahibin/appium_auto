import { remote } from "webdriverio";
import { env, requiredEnv } from "../config/env";
import CapabilitiesHelper from "../helper/CapabilitiesHelper";
import type { IDriverProvider } from "../interface/IDriverProvider";

export default class BrowserStackProvider implements IDriverProvider {
  async createDriver() {
    return remote({
      protocol: "https",
      hostname: "hub.browserstack.com",
      port: 443,
      path: "/wd/hub",
      user: requiredEnv("BROWSERSTACK_USERNAME"),
      key: requiredEnv("BROWSERSTACK_ACCESS_KEY"),
      logLevel: env.WDIO_LOG_LEVEL,
      waitforTimeout: 15000,
      connectionRetryCount: 1,
      // a real device may take a few minutes to be allocated
      connectionRetryTimeout: 300000,
      capabilities: this.getCapabilities(),
    });
  }

  getCapabilities(): WebdriverIO.Capabilities {
    // BrowserStack picks a matching Chromedriver for WebViews itself
    const profile = Object.fromEntries(
      Object.entries(CapabilitiesHelper.getProfile()).filter(([key]) => key !== "appium:chromedriverAutodownload")
    );
    return {
      ...profile,
      "appium:app": requiredEnv("BROWSERSTACK_APP"),
      "bstack:options": {
        deviceName: env.BROWSERSTACK_DEVICE,
        osVersion: env.BROWSERSTACK_OS_VERSION,
        projectName: "appium_auto",
        buildName: env.BROWSERSTACK_BUILD ?? `local ${new Date().toISOString().slice(0, 16)}`,
        sessionName: `${env.PLATFORM} tests`,
      },
    };
  }

  async markSession(driver: WebdriverIO.Browser, passed: boolean, reason: string) {
    const command = {
      action: "setSessionStatus",
      arguments: { status: passed ? "passed" : "failed", reason: reason.slice(0, 255) },
    };
    await driver.execute(`browserstack_executor: ${JSON.stringify(command)}`);
  }
}
