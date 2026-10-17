import { step as allureStep } from "allure-js-commons";

type TTitle = string | ((...args: never[]) => string);

// Allure step for an async method, like @Step in Java:
// @step("Clear the canvas") or @step((option: ESortOption) => `Sort products by '${option}'`)
export function step(title: TTitle) {
  return function <This, Args extends unknown[], Return>(method: (this: This, ...args: Args) => Promise<Return>) {
    return async function (this: This, ...args: Args): Promise<Return> {
      const name = typeof title === "string" ? title : (title as unknown as (...values: Args) => string)(...args);
      return allureStep(name, () => method.apply(this, args));
    };
  };
}
