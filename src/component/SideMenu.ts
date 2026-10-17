import type { ESideMenuItem } from "../data/enum/ESideMenuItem";
import DriverHelperFactory from "../helper/DriverHelperFactory";

export default class SideMenu {
  protected readonly menuButton = "~test-Menu";

  protected get helper() {
    return DriverHelperFactory.get();
  }

  async open(item: ESideMenuItem) {
    await this.helper.tap(this.menuButton);
    await this.helper.tap(`~test-${item}`);
  }
}
