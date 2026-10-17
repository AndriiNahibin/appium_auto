import { expect } from "chai";
import { sort } from "fast-sort";
import { users } from "../../src/data/dict/users";
import { priceSorting } from "../../src/data/fixture/products/sorting";
import LoginStep from "../../src/step/LoginStep";

describe("Products. Sorting by price", () => {
  priceSorting.forEach(({ name, testData, expected }) => {
    it(name, async () => {
      const productsScreen = await LoginStep.loginAs(users.standard);
      await productsScreen.sortBy(testData);

      const prices = (await productsScreen.getProducts()).map((product) => product.price);
      const sortedPrices = sort(prices)[expected]();

      expect(prices).to.have.length.greaterThan(1);
      expect(prices).to.deep.equal(sortedPrices);
    });
  });
});
