import type { TUser } from "../../types/TUser";

export const users = {
  standard: { username: "standard_user", password: "secret_sauce" },
} satisfies Record<string, TUser>;
