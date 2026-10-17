import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PLATFORM: z.enum(["android", "ios"]).default("android"),
  DRIVER_PROVIDER: z.enum(["local", "browserstack"]).default("local"),
  APPIUM_HOST: z.string().default("127.0.0.1"),
  APPIUM_PORT: z.coerce.number().default(4723),
  DEVICE_NAME: z.string().optional(),
  PLATFORM_VERSION: z.string().optional(),
  UDID: z.string().optional(),
  APP_PATH: z.string().min(1).optional(),
  BROWSERSTACK_USERNAME: z.string().min(1).optional(),
  BROWSERSTACK_ACCESS_KEY: z.string().min(1).optional(),
  BROWSERSTACK_APP: z.string().min(1).optional(),
  BROWSERSTACK_DEVICE: z.string().default("Google Pixel 8"),
  BROWSERSTACK_OS_VERSION: z.string().default("14.0"),
  BROWSERSTACK_BUILD: z.string().optional(),
  WDIO_LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "silent"]).default("warn"),
}).superRefine((env, ctx) => {
  const required = env.DRIVER_PROVIDER === "local"
    ? ["APP_PATH"] as const
    : ["BROWSERSTACK_USERNAME", "BROWSERSTACK_ACCESS_KEY", "BROWSERSTACK_APP"] as const;
  for (const name of required) {
    if (!env[name]) {
      ctx.addIssue({ code: "custom", path: [name], message: `required when DRIVER_PROVIDER=${env.DRIVER_PROVIDER}` });
    }
  }
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid .env\n${z.prettifyError(result.error)}`);
}

export const env = result.data;

// for values that the schema already requires for the current DRIVER_PROVIDER
export function requiredEnv(name: keyof typeof env) {
  const value = env[name];
  if (!value) {
    throw new Error(`${name} is not set in .env`);
  }
  return String(value);
}
