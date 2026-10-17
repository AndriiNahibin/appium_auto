import fs from "node:fs";
import path from "node:path";
import { env, requiredEnv } from "../src/config/env";

const UPLOAD_URL = "https://api-cloud.browserstack.com/app-automate/upload";

// uploads APP_PATH to BrowserStack; BROWSERSTACK_APP that is not a "bs://" url is sent as custom_id,
// so tests can always refer to the latest upload by that id
async function upload() {
  const file = path.resolve(requiredEnv("APP_PATH"));
  const credentials = `${requiredEnv("BROWSERSTACK_USERNAME")}:${requiredEnv("BROWSERSTACK_ACCESS_KEY")}`;

  const form = new FormData();
  form.append("file", await fs.openAsBlob(file), path.basename(file));
  const customId = env.BROWSERSTACK_APP?.startsWith("bs://") ? undefined : env.BROWSERSTACK_APP;
  if (customId) {
    form.append("custom_id", customId);
  }

  const response = await fetch(UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(credentials).toString("base64")}` },
    body: form,
  });
  if (!response.ok) {
    throw new Error(`Upload failed (${response.status}): ${await response.text()}`);
  }
  const body = await response.json() as { app_url: string, custom_id?: string };
  console.log(`Uploaded ${path.basename(file)}: ${body.app_url}${body.custom_id ? `, custom id '${body.custom_id}'` : ""}`);
}

upload().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
