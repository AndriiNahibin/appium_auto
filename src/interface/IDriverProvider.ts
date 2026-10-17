export interface IDriverProvider {
  createDriver: () => Promise<WebdriverIO.Browser>;
  // cloud providers show the result of a session on their dashboard
  markSession?: (driver: WebdriverIO.Browser, passed: boolean, reason: string) => Promise<void>;
}
