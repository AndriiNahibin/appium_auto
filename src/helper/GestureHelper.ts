import { step } from "../decorator/step";
import DriverManager from "../driver/DriverManager";
import type { TLocator } from "../types/TLocator";
import type { TPoint } from "../types/TPoint";
import ElementHelper from "./ElementHelper";

export default class GestureHelper {
  // finger moves from the lower to the upper part of the screen, the content scrolls down by "percent" of it
  @step("Swipe up")
  static async swipeUp(percent = 0.5) {
    const { width, height } = await DriverManager.get().getWindowSize();
    const x = Math.round(width / 2);
    const start = Math.round(height * (0.5 + percent / 2));
    const end = Math.round(height * (0.5 - percent / 2));
    await this.touch([{ x, y: start }, { x, y: end }], 1500);
  }

  // points are relative to the element: { x: 0, y: 0 } is its top left corner, { x: 1, y: 1 } is the bottom right one
  @step((locator: TLocator) => `Draw inside '${ElementHelper.getSelector(locator)}'`)
  static async drawInside(locator: TLocator, points: TPoint[]) {
    const { x, y, width, height } = await ElementHelper.getRect(locator);
    await this.touch(points.map((point) => ({
      x: Math.round(x + point.x * width),
      y: Math.round(y + point.y * height),
    })), 300);
  }

  // one finger: down on the first point, move through the rest (each move takes moveMs), up on the last one
  private static async touch(points: TPoint[], moveMs: number) {
    const [first, ...rest] = points;
    if (!first) {
      return;
    }
    const finger = DriverManager.get().action("pointer", { parameters: { pointerType: "touch" } }).move(first).down();
    for (const point of rest) {
      finger.move({ ...point, duration: moveMs });
    }
    // skip releaseActions (DELETE /actions): BrowserStack does not support it, and up() has already released the finger
    await finger.up().perform(true);
  }
}
