import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  PLATFORM: z.enum(["android", "ios"]).default("android"),
  APPIUM_HOST: z.string().default("127.0.0.1"),
  APPIUM_PORT: z.coerce.number().default(4723),
  DEVICE_NAME: z.string().optional(),
  PLATFORM_VERSION: z.string().optional(),
  UDID: z.string().optional(),
  APP_PATH: z.string().min(1),
  WDIO_LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "silent"]).default("warn"),
});

const result = envSchema.safeParse(process.env);
if (!result.success) {
  throw new Error(`Invalid .env\n${z.prettifyError(result.error)}`);
}

export const env = result.data;
