import { step as allureStep } from "allure-js-commons";

type TTitle = string | ((...args: never[]) => string);

// Allure step for an async method, like @Step in Java:
// @step("Clear the canvas") or @step((option: ESortOption) => `Sort products by '${option}'`)
export function step(title: TTitle) {
  return function <This, Args extends unknown[], Return>(method: (this: This, ...args: Args) => Promise<Return>) {
    return async function (this: This, ...args: Args): Promise<Return> {
      return allureStep(getStepName(title, args), () => method.apply(this, args));
    };
  };
}

// the title function may take fewer arguments than the method (a password is left out), so it is called untyped
function getStepName(title: TTitle, args: unknown[]) {
  return typeof title === "string" ? title : (title as (...values: unknown[]) => string)(...args);
}
