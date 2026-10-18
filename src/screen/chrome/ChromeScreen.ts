import { step } from "../../decorator/step";
import DriverManager from "../../driver/DriverManager";
import ElementHelper from "../../helper/ElementHelper";
import type { TLocator } from "../../types/TLocator";
import BaseScreen from "../BaseScreen";

// Chrome with the page the app opened a link to (About → saucelabs.com). Android only
export default class ChromeScreen extends BaseScreen {
  protected readonly urlBar = "id=com.android.chrome:id/url_bar";

  protected readonly page = "//android.webkit.WebView";

  // on the left of the toolbar: the menu button on the right is cut by the system bar in landscape on some devices
  protected readonly homeButton = "id=com.android.chrome:id/home_button";

  // whatever Chrome shows, to tell it from a crash
  protected readonly anyChromeElement = "android=new UiSelector().packageName(\"com.android.chrome\")";

  // a fresh Chrome shows them before the page, which ones depends on the device: the Welcome screen
  // (not on BrowserStack devices), then the notifications request (Android 13+)
  protected readonly firstRunButtons: TLocator[] = [
    "id=com.android.chrome:id/signin_fre_dismiss_button",
    "id=com.android.chrome:id/negative_button",
  ];

  constructor() {
    super();
    this.requiredElements = [this.urlBar, this.page, this.homeButton];
  }

  // the URL bar is hidden while a first run screen is shown, so its appearance means they are all closed
  @step("Close the Chrome first run screens")
  async closeFirstRunScreens(ms = 30000) {
    await DriverManager.get().waitUntil(async () => {
      for (const button of this.firstRunButtons) {
        if (await ElementHelper.isVisible(button)) {
          await ElementHelper.tap(button);
          return false;
        }
      }
      return ElementHelper.isVisible(this.urlBar);
    }, { timeout: ms, interval: 500, timeoutMsg: `Chrome page is not shown after ${ms}ms` });
  }

  // the home page differs between Chrome versions (the New Tab page has no URL bar, its content changes),
  // so the check is that Chrome left the page and is still shown
  @step("Open the Chrome home page")
  async openHomePage(ms = 15000) {
    const url = await this.getUrl();
    await ElementHelper.tap(this.homeButton);
    await DriverManager.get().waitUntil(
      async () => !(await ElementHelper.isVisible(this.urlBar)) || await this.getUrl() !== url,
      { timeout: ms, interval: 500, timeoutMsg: `Chrome is still on '${url}' after ${ms}ms` }
    );
    await ElementHelper.waitForDisplayed(this.anyChromeElement);
  }

  async getUrl() {
    return ElementHelper.getText(this.urlBar);
  }

  async getPageRect() {
    return ElementHelper.getRect(this.page);
  }
}
