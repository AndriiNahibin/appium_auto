import { attachment, ContentType } from "allure-js-commons";
import type { Context, RootHookObject } from "mocha";
import AppiumServer from "../src/driver/AppiumServer";
import DriverManager from "../src/driver/DriverManager";
import DriverHelperFactory from "../src/helper/DriverHelperFactory";

export const mochaHooks: RootHookObject = {
  async beforeAll() {
    await AppiumServer.ensureStarted();
    await DriverManager.start();
  },

  async beforeEach() {
    await DriverHelperFactory.get().restartApp();
  },

  async afterEach(this: Context) {
    if (this.currentTest?.state !== "failed") {
      return;
    }
    const driver = DriverManager.get();
    await attachment("Screenshot", Buffer.from(await driver.takeScreenshot(), "base64"), ContentType.PNG);
    await attachment("Page source", await driver.getPageSource(), ContentType.XML);
  },

  async afterAll() {
    await DriverManager.stop();
    await AppiumServer.stop();
  },
};
