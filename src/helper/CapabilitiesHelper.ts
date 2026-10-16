import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import { env } from "../config/env";
import type { TPlatform } from "../types/TPlatform";

// strict: unknown keys fail, so a typo like "appium:noRest" is not silently ignored by Appium.
// To use a new capability, add it here first.
const commonFields = {
  "appium:noReset": z.boolean().optional(),
  "appium:fullReset": z.boolean().optional(),
  "appium:newCommandTimeout": z.number().int().positive().optional(),
};

const androidSchema = z.strictObject({
  ...commonFields,
  platformName: z.literal("Android"),
  "appium:automationName": z.literal("UiAutomator2"),
  "appium:autoGrantPermissions": z.boolean().optional(),
  "appium:disableWindowAnimation": z.boolean().optional(),
  "appium:appWaitActivity": z.string().optional(),
  "appium:chromedriverAutodownload": z.boolean().optional(),
});

const iosSchema = z.strictObject({
  ...commonFields,
  platformName: z.literal("iOS"),
  "appium:automationName": z.literal("XCUITest"),
  "appium:autoAcceptAlerts": z.boolean().optional(),
});

const profileSchema = z.discriminatedUnion("platformName", [androidSchema, iosSchema]);

export default class CapabilitiesHelper {
  static getCapabilities(): WebdriverIO.Capabilities {
    return {
      ...this.readProfile(env.PLATFORM),
      "appium:app": path.resolve(env.APP_PATH),
      "appium:deviceName": env.DEVICE_NAME,
      "appium:platformVersion": env.PLATFORM_VERSION,
      "appium:udid": env.UDID,
    };
  }

  private static readProfile(platform: TPlatform) {
    const file = path.resolve("config", `${platform}.json`);
    const result = profileSchema.safeParse(JSON.parse(fs.readFileSync(file, "utf8")));
    if (!result.success) {
      throw new Error(`Invalid capabilities in '${file}'\n${z.prettifyError(result.error)}`);
    }
    if (result.data.platformName.toLowerCase() !== platform) {
      throw new Error(`'${file}' is for '${result.data.platformName}', but PLATFORM is '${platform}'`);
    }
    return result.data;
  }
}
