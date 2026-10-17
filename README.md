# Mobile UI autotests

UI tests for the [Swag Labs sample app](https://github.com/saucelabs/sample-app-mobile) (React Native, Android and iOS).

Stack: TypeScript, Mocha + Chai, WebdriverIO (standalone), Appium 3, Allure 3.
Tests run on a local Android emulator/device or on real devices in BrowserStack App Automate.

## Prepare for running tests

### Requirements

- Node.js 22.12 or newer
- Android SDK with an emulator (the easiest way is Android Studio → Device Manager) or a real device with USB debugging
- For iOS: macOS with Xcode. Locally iOS is not set up yet; on BrowserStack it works from any OS

Appium and its UiAutomator2 driver are project dependencies, so they are installed by `npm ci`,
nothing has to be installed globally.

### Setup

1. Clone the repository and install modules:
   ```bash
   npm ci
   ```
2. Download the app build, for example `Android.SauceLabs.Mobile.Sample.app.2.7.1.apk`
   from the [releases page](https://github.com/saucelabs/sample-app-mobile/releases).
3. Create `.env` from the example and fill it in:
   ```bash
   cp .env.example .env
   ```
   The minimum for a local run:
   ```
   APP_PATH=/path/to/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk
   ANDROID_HOME=/home/<user>/Android/Sdk
   DEVICE_NAME=emulator-5554        # from `adb devices`
   ```
   `.env` is in `.gitignore`: keep local paths and keys only there.

## Run tests on local machine

1. Start the emulator (or connect a device) and check that it is visible:
   ```bash
   adb devices
   ```
2. Run the tests:
   ```bash
   npm test                                              # all tests
   npx mocha test/drawing/clearCanvas.ts                 # one file
   npx mocha test/products/*.ts                          # one directory
   npm test -- --grep "Price \(high to low\)"            # one test by name (regexp)
   ```

Appium is started by the tests when nothing answers on `APPIUM_HOST:APPIUM_PORT`, and stopped after the run.
Its log is written to `logs/appium.log`. If you start Appium yourself, the tests use it and leave it running;
start it with the flag that WebView tests need:
```bash
npx appium --allow-insecure uiautomator2:chromedriver_autodownload
```

Tests can also be run from WebStorm with the green arrows next to `describe` / `it`.

## Run tests on BrowserStack

Tests run on real devices of BrowserStack App Automate.

1. Add the keys to `.env`. They are in the BrowserStack account: App Automate → "Access Key"
   (the same values are shown in Account → Settings → Local Testing):
   ```
   BROWSERSTACK_USERNAME=<username>
   BROWSERSTACK_ACCESS_KEY=<access key>
   BROWSERSTACK_APP=SwagLabs
   ```
2. Choose the device (optional, the default is Google Pixel 8 / Android 14.0):
   ```
   BROWSERSTACK_DEVICE=Google Pixel 7
   BROWSERSTACK_OS_VERSION=13.0
   ```
   Names must match BrowserStack exactly. The devices available for your account:
   ```bash
   curl -u "<username>:<access key>" https://api-cloud.browserstack.com/app-automate/devices.json
   ```
3. Upload the app and run the tests:
   ```bash
   npm run test:browserstack:fresh     # upload APP_PATH to BrowserStack, then run the tests
   npm run test:browserstack           # run the tests on the already uploaded app
   npm run bs:upload                   # only upload the app
   ```
   The app is uploaded with `BROWSERSTACK_APP` as its custom id, and the tests always take the latest upload
   with that id. Upload again only when there is a new build.

One file or one test on BrowserStack:
```bash
DRIVER_PROVIDER=browserstack npx mocha test/drawing/clearCanvas.ts
npm run test:browserstack -- --grep "Clear removes the drawing"
```

The video, Appium and device logs of every run are on the App Automate dashboard: project `appium_auto`,
build `local <date>` (or `BROWSERSTACK_BUILD`). All tests of a run share one session, so there is one video per run.
The session is marked passed or failed (with the names of the failed tests) at the end of the run.

## Reports

Every run writes results to `allure-results/`. To build and open the Allure report:
```bash
npm run report
```
Every test is shown as a tree of steps ("Log in as 'standard_user'" → "Tap '~test-LOGIN'"...).
For a failed test the report has a screenshot and the page source of the screen at the moment of the failure.

## Environment variables

All of them are in `.env.example` with comments.

| Variable | Default | Description |
|---|---|---|
| `PLATFORM` | `android` | `android` or `ios`; selects `config/<platform>.json` |
| `DRIVER_PROVIDER` | `local` | `local` (Appium on this machine) or `browserstack` |
| `APP_PATH` | | Path to `.apk` / `.app` / `.ipa`. Required for local runs and `bs:upload` |
| `ANDROID_HOME` | | Android SDK path. Needed when tests are started from an IDE, which does not read `~/.bashrc` |
| `DEVICE_NAME`, `PLATFORM_VERSION`, `UDID` | | Local device |
| `APPIUM_HOST`, `APPIUM_PORT` | `127.0.0.1`, `4723` | Local Appium server |
| `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY` | | BrowserStack keys |
| `BROWSERSTACK_APP` | | Custom id (or `bs://...` url) of the uploaded app |
| `BROWSERSTACK_DEVICE`, `BROWSERSTACK_OS_VERSION` | `Google Pixel 8`, `14.0` | BrowserStack device |
| `BROWSERSTACK_BUILD` | `local <date>` | Build name on the BrowserStack dashboard |
| `WDIO_LOG_LEVEL` | `warn` | WebdriverIO log level |

`.env` is checked when the tests start: a missing or wrong value fails the run with the list of problems.
Variables from the command line override `.env`.

## Project structure

```
config/
  android.json, ios.json      static Appium capabilities per platform (checked by a schema)
scripts/
  browserstackUpload.ts       npm run bs:upload
src/
  component/                  blocks shared by screens (SideMenu)
  config/env.ts               .env loading and validation
  data/
    dict/                     test data dictionaries (users)
    enum/                     enums (menu items, sort options)
    fixture/                  data providers for tests
  driver/
    DriverManager.ts          start / get / stop of the session
    DriverProviderFactory.ts  local Appium or BrowserStack, by DRIVER_PROVIDER
    LocalAppiumProvider.ts    session on the local Appium
    BrowserStackProvider.ts   session on BrowserStack
    AppiumServer.ts           starts local Appium when it is not running
  decorator/step.ts           @step: makes a method an Allure step, like @Step in Java
  helper/
    ElementHelper.ts          find, wait for and act on elements: tap, type, getText...
    GestureHelper.ts          swipe and drawing gestures
    WebViewHelper.ts          runs JS inside a WebView and returns to the native context
    BaseDriverHelper.ts       what differs between platforms: app restart/close, keyboard
    AndroidHelper.ts          Android implementation
    IOSHelper.ts              iOS implementation (not verified on iOS yet)
    DriverHelperFactory.ts    platform helper for the current PLATFORM
    CapabilitiesHelper.ts     capabilities from config/<platform>.json and .env
  interface/                  interfaces
  screen/                     Screen Objects, one folder per feature
    BaseScreen.ts             base class: requiredElements, shouldBeOpen()
  step/                       multi-screen flows (LoginStep)
  types/                      types
test/
  hooks.ts                    Mocha root hooks: session, app restart, attachments on failure
  <feature>/<test>.ts         tests
```

## Writing tests

- **Screens** extend `BaseScreen`, keep locators in `protected readonly` fields and list the elements
  that prove the screen is open in `requiredElements`. Screens expose user actions, tests make assertions.
- **Locators** are a string when they are the same on both platforms (`"~test-LOGIN"`),
  or `{ android, ios }` when they differ.
- **Actions** go through `ElementHelper`, `GestureHelper` and `WebViewHelper`; platform specific ones (keyboard, app lifecycle)
  through `this.device` in screens.
- **Allure steps**: mark user level screen methods with `@step(...)`. Helper actions (tap, type, swipe...) are steps
  already, so the report shows a test as a tree of readable steps.
- **Test data** lives in `src/data`: one test per data provider entry, see `test/products/sortProductsByPrice.ts`.
- **App state**: the app is restarted before every test, so each test starts from the login screen.
- Run `npm run typecheck` and `npm run lint` before a commit (`npm run lint:fix` fixes the code style).

## Troubleshooting

| Error | Fix |
|---|---|
| `Neither ANDROID_HOME nor ANDROID_SDK_ROOT environment variable was exported` | Set `ANDROID_HOME` in `.env` (usual when running from an IDE) |
| `The application at '...' does not exist or is not accessible` | Check `APP_PATH` in `.env` |
| `Invalid .env` | Fix the variables listed in the message |
| WebView test fails to switch context | Appium started by hand needs `--allow-insecure uiautomator2:chromedriver_autodownload` |
| Tests hang, `adb shell` does not answer | The emulator hung: restart it |
