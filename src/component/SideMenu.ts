import type { ESideMenuItem } from "../data/enum/ESideMenuItem";
import { step } from "../decorator/step";
import ElementHelper from "../helper/ElementHelper";

export default class SideMenu {
  protected readonly menuButton = "~test-Menu";

  @step((item: ESideMenuItem) => `Open '${item}' from the side menu`)
  async open(item: ESideMenuItem) {
    await ElementHelper.tap(this.menuButton);
    await ElementHelper.tap(`~test-${item}`);
  }
}
