export interface IDriverProvider {
  createDriver: () => Promise<WebdriverIO.Browser>;
}
