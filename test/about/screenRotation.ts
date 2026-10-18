import { expect } from "chai";
import { env } from "../../src/config/env";
import { users } from "../../src/data/dict/users";
import { ESideMenuItem } from "../../src/data/enum/ESideMenuItem";
import DriverHelperFactory from "../../src/helper/DriverHelperFactory";
import ChromeScreen from "../../src/screen/chrome/ChromeScreen";
import LoginStep from "../../src/step/LoginStep";

// About is not a screen of the app: it opens saucelabs.com in Chrome, and the app itself is locked to portrait.
// So the rotation is checked in Chrome
describe("About. Screen rotation", () => {
  before(function () {
    if (env.PLATFORM !== "android") {
      this.skip();
    }
  });

  it("Chrome page stays usable after rotation to landscape", async () => {
    const device = DriverHelperFactory.get();
    const productsScreen = await LoginStep.loginAs(users.standard);
    await productsScreen.menu.open(ESideMenuItem.ABOUT);
    const chromeScreen = new ChromeScreen();
    await chromeScreen.closeFirstRunScreens();
    await device.rotate("PORTRAIT");
    await chromeScreen.shouldBeOpen();
    expect(await chromeScreen.getUrl(), "URL opened by About").to.include("saucelabs.com");

    await device.rotate("LANDSCAPE");

    const window = await device.getWindowSize();
    expect(await device.getOrientation(), "orientation after rotation").to.equal("LANDSCAPE");
    expect(window.width, "window width after rotation").to.be.greaterThan(window.height);

    await chromeScreen.shouldBeOpen();
    // a rotation may recreate the screen, and a lost state shows as a reloaded or another page
    expect(await chromeScreen.getUrl(), "URL after rotation").to.include("saucelabs.com");
    // a page that kept the portrait layout is not wider than the portrait screen
    const page = await chromeScreen.getPageRect();
    expect(page.width, "page width after rotation").to.be.greaterThan(window.height);

    await chromeScreen.openHomePage();
  });
});
