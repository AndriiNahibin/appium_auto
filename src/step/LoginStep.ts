import LoginScreen from "../screen/auth/LoginScreen";
import ProductsScreen from "../screen/products/ProductsScreen";
import type { TUser } from "../types/TUser";

export default class LoginStep {
  static async loginAs(user: TUser) {
    const loginScreen = new LoginScreen();
    await loginScreen.shouldBeOpen();
    await loginScreen.login(user.username, user.password);
    const productsScreen = new ProductsScreen();
    await productsScreen.shouldBeOpen();
    return productsScreen;
  }
}
