import { step } from "../../decorator/step";
import ElementHelper from "../../helper/ElementHelper";
import GestureHelper from "../../helper/GestureHelper";
import WebViewHelper from "../../helper/WebViewHelper";
import BaseScreen from "../BaseScreen";

// the canvas is an HTML <canvas> inside a WebView, so its pixels are read with JS in the WebView context
const COUNT_PAINTED_PIXELS = `
  const canvas = document.querySelector("canvas");
  const pixels = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
  let painted = 0;
  for (let alpha = 3; alpha < pixels.length; alpha += 4) {
    if (pixels[alpha] !== 0) painted++;
  }
  return painted;
`;

export default class DrawingScreen extends BaseScreen {
  protected readonly screen = "~test-DRAWING-SCREEN";

  protected readonly canvas = {
    android: "//android.webkit.WebView",
    ios: "//XCUIElementTypeWebView",
  };

  protected readonly clearButton = "~test-CLEAR";

  protected readonly saveButton = "~test-SAVE";

  constructor() {
    super();
    this.requiredElements = [this.screen, this.canvas, this.clearButton, this.saveButton];
  }

  // side is a part of the canvas width; the canvas is not square, so the height part is recalculated
  @step("Draw a square on the canvas")
  async drawSquare(side = 0.5) {
    const { width, height } = await ElementHelper.getRect(this.canvas);
    const halfX = side / 2;
    const halfY = (side * width) / height / 2;
    await GestureHelper.drawInside(this.canvas, [
      { x: 0.5 - halfX, y: 0.5 - halfY },
      { x: 0.5 + halfX, y: 0.5 - halfY },
      { x: 0.5 + halfX, y: 0.5 + halfY },
      { x: 0.5 - halfX, y: 0.5 + halfY },
      { x: 0.5 - halfX, y: 0.5 - halfY },
    ]);
  }

  @step("Clear the canvas")
  async clear() {
    await ElementHelper.tap(this.clearButton);
  }

  @step("Count painted pixels on the canvas")
  async getPaintedPixelsCount() {
    const count = await WebViewHelper.execute(COUNT_PAINTED_PIXELS);
    if (typeof count !== "number") {
      throw new Error(`Expected a number of painted pixels, got ${JSON.stringify(count)}`);
    }
    return count;
  }
}
