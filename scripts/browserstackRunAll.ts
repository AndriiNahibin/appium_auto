import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { z } from "zod";
import { env } from "../src/config/env";

const devicesSchema = z.array(z.strictObject({
  deviceName: z.string().min(1),
  osVersion: z.string().min(1),
})).min(1);

type TDevice = z.infer<typeof devicesSchema>[number];

// one build on the dashboard for the whole run, with a session (and so a video) per device
const build = env.BROWSERSTACK_BUILD ?? `all devices ${new Date().toISOString().slice(0, 16)}`;

// the whole suite on one device in its own Mocha process: the driver is one per process, the device comes from env.
// Extra arguments go to Mocha: npm run test:browserstack:all -- --grep "Price"
function runOnDevice(device: TDevice) {
  const label = `[${device.deviceName} ${device.osVersion}]`;
  const child = spawn("npx", ["mocha", "test/**/*.ts", ...process.argv.slice(2)], {
    env: {
      ...process.env,
      DRIVER_PROVIDER: "browserstack",
      BROWSERSTACK_DEVICE: device.deviceName,
      BROWSERSTACK_OS_VERSION: device.osVersion,
      BROWSERSTACK_BUILD: build,
    },
  });
  // three processes write at once, so every line says which device it is about
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on("line", (line) => console.log(`${label} ${line}`));
  }
  return new Promise<{ label: string, passed: boolean }>((resolve) => {
    child.on("close", (code) => resolve({ label, passed: code === 0 }));
  });
}

async function runAll() {
  const file = path.resolve("config/browserstack-devices.json");
  const devices = devicesSchema.parse(JSON.parse(fs.readFileSync(file, "utf8")));
  console.log(`Running on ${devices.length} devices, BrowserStack build '${build}'`);

  const results = await Promise.all(devices.map(runOnDevice));
  console.log("\nResults:");
  for (const { label, passed } of results) {
    console.log(`  ${passed ? "passed" : "FAILED"} ${label}`);
  }
  if (results.some(({ passed }) => !passed)) {
    process.exitCode = 1;
  }
}

runAll().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
