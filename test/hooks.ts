import { attachment, ContentType } from "allure-js-commons";
import type { Context, RootHookObject } from "mocha";
import { env } from "../src/config/env";
import AppiumServer from "../src/driver/AppiumServer";
import DriverManager from "../src/driver/DriverManager";
import DriverHelperFactory from "../src/helper/DriverHelperFactory";

// one session for the whole run, so its status is "failed" when any test failed
const failedTests: string[] = [];

export const mochaHooks: RootHookObject = {
  async beforeAll() {
    if (env.DRIVER_PROVIDER === "local") {
      await AppiumServer.ensureStarted();
    }
    await DriverManager.start();
  },

  async beforeEach() {
    await DriverHelperFactory.get().restartApp();
  },

  async afterEach(this: Context) {
    if (this.currentTest?.state !== "failed") {
      return;
    }
    failedTests.push(this.currentTest.fullTitle());
    const driver = DriverManager.get();
    await attachment("Screenshot", Buffer.from(await driver.takeScreenshot(), "base64"), ContentType.PNG);
    await attachment("Page source", await driver.getPageSource(), ContentType.XML);
  },

  async afterAll() {
    // finally: the session and the local Appium are closed even if a previous step fails,
    // otherwise a cloud session keeps running until its idle timeout
    try {
      // skipped when the driver failed to start
      if (DriverManager.isStarted()) {
        const reason = failedTests.length ? `Failed: ${failedTests.join("; ")}` : "All tests passed";
        await DriverManager.markSession(failedTests.length === 0, reason);
        // the session video then ends on a closed app
        await DriverHelperFactory.get().terminateApp();
      }
    }
    finally {
      try {
        await DriverManager.stop();
      }
      finally {
        await AppiumServer.stop();
      }
    }
  },
};
