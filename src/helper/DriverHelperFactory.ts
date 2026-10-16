import { env } from "../config/env";
import AndroidHelper from "./AndroidHelper";
import type BaseDriverHelper from "./BaseDriverHelper";
import IOSHelper from "./IOSHelper";

export default class DriverHelperFactory {
  private static helper?: BaseDriverHelper;

  static get() {
    if (!this.helper) {
      this.helper = env.PLATFORM === "android" ? new AndroidHelper() : new IOSHelper();
    }
    return this.helper;
  }
}
