import { step } from "../../decorator/step";
import ElementHelper from "../../helper/ElementHelper";
import BaseScreen from "../BaseScreen";

export default class LoginScreen extends BaseScreen {
  protected readonly usernameInput = "~test-Username";

  protected readonly passwordInput = "~test-Password";

  protected readonly loginButton = "~test-LOGIN";

  constructor() {
    super();
    this.requiredElements = [this.usernameInput, this.passwordInput, this.loginButton];
  }

  @step((username: string) => `Log in as '${username}'`)
  async login(username: string, password: string) {
    await ElementHelper.type(this.usernameInput, username);
    await ElementHelper.type(this.passwordInput, password);
    // the keyboard covers the LOGIN button
    await this.device.hideKeyboard();
    await ElementHelper.tap(this.loginButton);
  }
}
