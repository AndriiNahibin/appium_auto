import { expect } from "chai";
import { users } from "../../src/data/dict/users";
import { ESideMenuItem } from "../../src/data/enum/ESideMenuItem";
import DrawingScreen from "../../src/screen/drawing/DrawingScreen";
import LoginStep from "../../src/step/LoginStep";

describe("Drawing. Clear canvas", () => {
  it("Clear removes the drawing", async () => {
    const productsScreen = await LoginStep.loginAs(users.standard);
    await productsScreen.menu.open(ESideMenuItem.DRAWING);
    const drawingScreen = new DrawingScreen();
    await drawingScreen.shouldBeOpen();
    expect(await drawingScreen.getPaintedPixelsCount(), "painted pixels before dr awing").to.equal(0);

    await drawingScreen.drawSquare();
    // otherwise a broken drawing would make the clear check below pass for nothing
    expect(await drawingScreen.getPaintedPixelsCount(), "painted pixels after drawing").to.be.greaterThan(0);

    await drawingScreen.clear();
    expect(await drawingScreen.getPaintedPixelsCount(), "painted pixels after clear").to.equal(0);
  });
});
