export interface IDriverProvider {
  createDriver: () => Promise<WebdriverIO.Browser>;
  // for reports: tests of the same suite run on several devices
  getDeviceName: () => string;
  // cloud providers show the result of a session on their dashboard
  markSession?: (driver: WebdriverIO.Browser, passed: boolean, reason: string) => Promise<void>;
}
