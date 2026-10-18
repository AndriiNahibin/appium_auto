# Mobile UI autotests

UI tests for the [Swag Labs sample app](https://github.com/saucelabs/sample-app-mobile) (React Native, Android and iOS).

Stack: TypeScript, Mocha + Chai, WebdriverIO (standalone), Appium 3, Allure 3.
Tests run on a local Android emulator/device or on real devices in BrowserStack App Automate.

## 1. Requirements

- Node.js 22.12 or newer
- Java JDK 9 or newer, with `JAVA_HOME` set: the UiAutomator2 driver needs it
- Android SDK with an emulator (Android Studio → Device Manager) or a real device with USB debugging
- `adb` in `PATH`: add `platform-tools` of the Android SDK, e.g. in `~/.bashrc`:
  ```bash
  export PATH="$PATH:$HOME/Android/Sdk/platform-tools"
  ```
  Check: `adb version`
- For iOS: macOS with Xcode (iOS is not verified yet)

Appium and its UiAutomator2 driver are project dependencies, nothing has to be installed globally.

## 2. Install

1. Install modules:
   ```bash
   npm ci
   ```
2. Download the app build, e.g. `Android.SauceLabs.Mobile.Sample.app.2.7.1.apk`
   from the [releases page](https://github.com/saucelabs/sample-app-mobile/releases).

## 3. Configure `.env`

```bash
cp .env.example .env
```
The minimum for a local run:
```
APP_PATH=/path/to/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk
ANDROID_HOME=/home/<user>/Android/Sdk
DEVICE_NAME=emulator-5554        # from `adb devices`
```
All variables are described in `.env.example` and in [Environment variables](#environment-variables).

## 4. Run tests locally

Start the emulator (or connect a device), check it with `adb devices`, then:
```bash
npm test                                         # all tests
npx mocha test/drawing/clearCanvas.ts            # one file
npm test -- --grep "Price \(high to low\)"       # one test by name (regexp)
```

The tests start Appium themselves when it is not running, and stop it after the run. Its log is `logs/appium.log`.
If you start Appium yourself, add the flag that WebView tests need:
```bash
npx appium --allow-insecure uiautomator2:chromedriver_autodownload
```

## 5. Open the report

```bash
npm run report                                       # build and open the Allure report
npm run report:clean && npm test && npm run report   # a report of one run only
```
Results are not cleaned between runs, so without `report:clean` the report includes all previous runs.
Every test is a tree of steps; a failed test has a screenshot and the page source.
Runs on several devices are shown separately by the "Device" parameter.

## 6. Run tests on BrowserStack

1. Add to `.env` (keys: BrowserStack account → App Automate → "Access Key"):
   ```
   BROWSERSTACK_USERNAME=<username>
   BROWSERSTACK_ACCESS_KEY=<access key>
   BROWSERSTACK_APP=SwagLabs              # a custom id, not a bs://... url: then tests take the latest upload
   # BROWSERSTACK_DEVICE=Google Pixel 8   # optional; About needs Chrome as the default browser (checked: Pixels, Galaxy S24)
   # BROWSERSTACK_OS_VERSION=14.0
   ```
2. Run:
   ```bash
   npm run test:browserstack:fresh     # upload APP_PATH, then run the tests
   npm run test:browserstack           # run on the already uploaded app
   npm run test:browserstack:all       # every device of config/browserstack-devices.json in parallel
   npm run bs:upload                   # only upload the app
   ```
   Extra arguments go to Mocha: `npm run test:browserstack:all -- --grep "Price"`.
3. See the results on the App Automate dashboard (project `appium_auto`): one session with a video
   and logs per device, marked passed or failed.

## 7. Project structure

```
config/      Appium capabilities per platform, BrowserStack devices
scripts/     BrowserStack upload and the parallel run on all devices
src/
  component/ blocks shared by screens (SideMenu)
  config/    .env loading and validation
  data/      test data: users, enums, data providers
  decorator/ @step: a method as an Allure step
  driver/    session: local Appium or BrowserStack
  helper/    elements, gestures, WebView, platform specific actions
  screen/    Screen Objects, one folder per feature
  step/      flows across several screens (LoginStep)
  types/, interface/
test/
  hooks.ts   session, app restart before every test, attachments on failure
  <feature>/ tests
```

## 8. Writing tests

- **Screens** extend `BaseScreen`, keep locators in `protected readonly` fields and list the elements
  that prove the screen is open in `requiredElements`. Screens expose user actions, tests make assertions.
- **Locators** are a string when they are the same on both platforms (`"~test-LOGIN"`),
  or `{ android, ios }` when they differ.
- **Actions** go through `ElementHelper`, `GestureHelper` and `WebViewHelper`; keyboard and app lifecycle
  through `this.device` in screens.
- **Allure steps**: mark user level screen methods with `@step(...)`. Helper actions are steps already.
- **Test data** lives in `src/data`: one test per data provider entry, see `test/products/sortProductsByPrice.ts`.
- **State**: before every test the device is set to portrait and the app is restarted (each test starts
  from the login screen); after it Chrome is closed if a test opened it.
- Run `npm run typecheck` and `npm run lint` before a commit (`npm run lint:fix` fixes the code style).

## Environment variables

`.env` is checked when the tests start: a missing or wrong value fails the run with the list of problems.
Variables from the command line override `.env`.

| Variable | Default | Description |
|---|---|---|
| `PLATFORM` | `android` | `android` or `ios` |
| `DRIVER_PROVIDER` | `local` | `local` or `browserstack` |
| `APP_PATH` | | App build. Required for local runs and `bs:upload` |
| `ANDROID_HOME` | | Android SDK path |
| `DEVICE_NAME`, `PLATFORM_VERSION`, `UDID` | | Local device |
| `APPIUM_HOST`, `APPIUM_PORT` | `127.0.0.1`, `4723` | Local Appium |
| `BROWSERSTACK_USERNAME`, `BROWSERSTACK_ACCESS_KEY` | | BrowserStack keys |
| `BROWSERSTACK_APP` | | Custom id of the uploaded app |
| `BROWSERSTACK_DEVICE`, `BROWSERSTACK_OS_VERSION` | `Google Pixel 8`, `14.0` | BrowserStack device |
| `BROWSERSTACK_BUILD` | `local <date>`, `all devices <date>` for `test:browserstack:all` | Build name on the dashboard |
| `WDIO_LOG_LEVEL` | `warn` | WebdriverIO log level |

## Test cases

| Test | File | What it checks |
|---|---|---|
| Sorting by price | `test/products/sortProductsByPrice.ts` | The whole product list is in price order after "low to high" and "high to low" |
| Clear canvas | `test/drawing/clearCanvas.ts` | A drawn square is removed by Clear (painted pixels: 0 → more than 0 → 0) |
| Screen rotation | `test/about/screenRotation.ts` | The page About opens in Chrome stays shown and usable after rotation to landscape |

