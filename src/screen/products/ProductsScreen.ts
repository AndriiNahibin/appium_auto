import SideMenu from "../../component/SideMenu";
import type { ESortOption } from "../../data/enum/ESortOption";
import type { TProduct } from "../../types/TProduct";
import BaseScreen from "../BaseScreen";

export default class ProductsScreen extends BaseScreen {
  readonly menu = new SideMenu();

  protected readonly title = this.helper.byText("PRODUCTS");

  protected readonly sortButton = "~test-Modal Selector Button";

  protected readonly productItem = "~test-Item";

  protected readonly productName = "~test-Item title";

  protected readonly productPrice = "~test-Price";

  // has no test id; the copyright line above it contains the year, so it is not used
  protected readonly listFooter = this.helper.byText("Terms of Service | Privacy Policy");

  constructor() {
    super();
    this.requiredElements = [this.title, this.sortButton];
  }

  async sortBy(option: ESortOption) {
    const optionButton = this.helper.byText(option);
    await this.helper.tap(this.sortButton);
    await this.helper.tap(optionButton);
    await this.helper.waitForNotExisting(optionButton);
  }

  // the list may not fit on the screen, so swipe down to the footer collecting products on the way.
  // The footer is the explicit end: "no new products after a swipe" would also stop when a swipe did not scroll
  async getProducts(maxSwipes = 10) {
    // after sorting the list is re-rendered, and for a moment there are no items at all
    await this.helper.waitForDisplayed(this.productItem);
    const products = new Map<string, TProduct>();
    for (let swipe = 0; swipe <= maxSwipes; swipe++) {
      for (const product of await this.getVisibleProducts()) {
        products.set(product.name, product);
      }
      if (await this.helper.isVisible(this.listFooter)) {
        return [...products.values()];
      }
      await this.helper.swipeUp();
    }
    throw new Error(`End of products list is not reached after ${maxSwipes} swipes`);
  }

  private async getVisibleProducts() {
    const products: TProduct[] = [];
    for (const item of await this.helper.getElements(this.productItem)) {
      const name = await this.helper.getChildText(item, this.productName);
      const price = await this.helper.getChildText(item, this.productPrice);
      if (name && price) {
        products.push({ name, price: Number(price.replace("$", "")) });
      }
    }
    return products;
  }
}
