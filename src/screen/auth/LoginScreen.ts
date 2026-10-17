import BaseScreen from "../BaseScreen";

export default class LoginScreen extends BaseScreen {
  protected readonly usernameInput = "~test-Username";

  protected readonly passwordInput = "~test-Password";

  protected readonly loginButton = "~test-LOGIN";

  constructor() {
    super();
    this.requiredElements = [this.usernameInput, this.passwordInput, this.loginButton];
  }

  async login(username: string, password: string) {
    await this.helper.type(this.usernameInput, username);
    await this.helper.type(this.passwordInput, password);
    // the keyboard covers the LOGIN button
    await this.helper.hideKeyboard();
    await this.helper.tap(this.loginButton);
  }
}
