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

  it("Chrome page stays usable after rotation to landscape and back", async () => {
    const device = DriverHelperFactory.get();
    const productsScreen = await LoginStep.loginAs(users.standard);
    await productsScreen.menu.open(ESideMenuItem.ABOUT);
    const chromeScreen = new ChromeScreen();
    await chromeScreen.closeFirstRunScreens();
    // the app is locked to portrait, but Chrome follows the sensor: a real device lying on its side opens it
    // in landscape. A rotation by the test also locks the sensor, so the start orientation is set, not assumed
    await device.rotate("PORTRAIT");
    await chromeScreen.shouldBeOpen();
    expect(await chromeScreen.getUrl(), "URL opened by About").to.include("saucelabs.com");

    await device.rotate("LANDSCAPE");

    const landscapeWindow = await device.getWindowSize();
    expect(await device.getOrientation(), "orientation after rotation").to.equal("LANDSCAPE");
    expect(landscapeWindow.width, "window width after rotation").to.be.greaterThan(landscapeWindow.height);

    await chromeScreen.shouldBeOpen();
    // a rotation may recreate the screen, and a lost state shows as a reloaded or another page
    expect(await chromeScreen.getUrl(), "URL after rotation").to.include("saucelabs.com");
    // a page that kept the portrait layout is not wider than the portrait screen
    const page = await chromeScreen.getPageRect();
    expect(page.width, "page width after rotation").to.be.greaterThan(landscapeWindow.height);

    await device.rotate("PORTRAIT");

    const portraitWindow = await device.getWindowSize();
    expect(await device.getOrientation(), "orientation after rotation back").to.equal("PORTRAIT");
    expect(portraitWindow.height, "window height after rotation back").to.be.greaterThan(portraitWindow.width);
    await chromeScreen.shouldBeOpen();
    expect(await chromeScreen.getUrl(), "URL after rotation back").to.include("saucelabs.com");

    // a screen that looks right may still not react, so it is also used, not only looked at
    await chromeScreen.openHomePage();
  });
});
