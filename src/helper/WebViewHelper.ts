import { step } from "../decorator/step";
import DriverManager from "../driver/DriverManager";

export default class WebViewHelper {
  @step("Run a script in the WebView")
  static async execute(script: string, ms = 10000) {
    const driver = DriverManager.get();
    let webView: string | undefined;
    await driver.waitUntil(async () => {
      const contexts = await driver.getContexts();
      webView = contexts.map(String).find((context) => context.startsWith("WEBVIEW"));
      return Boolean(webView);
    }, { timeout: ms, timeoutMsg: `No WebView context after ${ms}ms` });

    await driver.switchContext(webView as string);
    try {
      return await driver.execute(script);
    }
    finally {
      await driver.switchContext("NATIVE_APP");
    }
  }
}
