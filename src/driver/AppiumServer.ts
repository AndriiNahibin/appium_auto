import { type ChildProcess, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import got from "got";
import { env } from "../config/env";

const LOG_FILE = path.resolve("logs", "appium.log");

export default class AppiumServer {
  private static server?: ChildProcess;

  // reuse a running server; start our own only when nothing answers on APPIUM_HOST:APPIUM_PORT
  static async ensureStarted(ms = 60000) {
    if (await this.isRunning()) {
      return;
    }
    if (!["127.0.0.1", "localhost"].includes(env.APPIUM_HOST)) {
      throw new Error(`Appium is not running on ${this.url}, and a remote host can not be started from here`);
    }

    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    const log = fs.openSync(LOG_FILE, "w");
    this.server = spawn(path.resolve("node_modules", ".bin", "appium"), [
      "--address", env.APPIUM_HOST,
      "--port", String(env.APPIUM_PORT),
      "--allow-insecure", "uiautomator2:chromedriver_autodownload",
      "--log-timestamp",
      "--log-no-colors",
    ], { stdio: ["ignore", log, log] });
    // do not leave the server running if the test process dies without afterAll
    process.once("exit", () => this.server?.kill());

    await this.waitUntilRunning(ms);
  }

  static async stop() {
    const { server } = this;
    if (!server) {
      return;
    }
    this.server = undefined;
    const exited = new Promise((resolve) => server.once("exit", resolve));
    server.kill();
    await exited;
  }

  private static get url() {
    return `http://${env.APPIUM_HOST}:${env.APPIUM_PORT}`;
  }

  private static async isRunning() {
    try {
      // no retries: waitUntilRunning polls by itself, and a got retry would stretch every check
      await got(`${this.url}/status`, { timeout: { request: 2000 }, retry: { limit: 0 } });
      return true;
    }
    catch {
      return false;
    }
  }

  private static async waitUntilRunning(ms: number) {
    const deadline = Date.now() + ms;
    while (Date.now() < deadline) {
      if (this.server && (this.server.exitCode !== null || this.server.signalCode !== null)) {
        throw new Error(`Appium exited (${this.server.exitCode ?? this.server.signalCode}), see ${LOG_FILE}`);
      }
      if (await this.isRunning()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(`Appium did not start on ${this.url} in ${ms}ms, see ${LOG_FILE}`);
  }
}
