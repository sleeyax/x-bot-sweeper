# X Bot Sweeper

[![Available in the Chrome Web Store](https://storage.googleapis.com/web-dev-uploads/image/WlD8wC6g8khYWPJUsQceQkhXSlv1/UV4C4ybeBTsZt43U4xis.png)](https://chromewebstore.google.com/detail/x-bot-sweeper/fhhpkkpmedefldnkocodcmncpmocfbib)

Browser extension to semi-automatically identify and block fake followers or bots on X (formerly Twitter).

![screenshot](./assets/screenshot.png)

## Installation

### Chromium
Chrome, brave, edge and other chromium-based browsers can install the extension directly from the Chrome Web Store:

[Link to Chrome Web Store page](https://chromewebstore.google.com/detail/x-bot-sweeper/fhhpkkpmedefldnkocodcmncpmocfbib)

### Manual installation
You may wish to install the extension manually if you want to use a specific version or if you are a developer. Follow these steps:

1. Download the [latest release](https://github.com/sleeyax/x-bot-sweeper/releases) for your preferred browser.
2. Unzip the downloaded file.
3. Open your browser and navigate to `chrome://extensions`.
4. Enable the "Developer mode" toggle in the top right corner.
5. Click the "Load unpacked" button and select the unzipped folder.

The extension should now be installed and ready to use. Pin it to your browser toolbar for easy access.

## Usage
See [my article on dev.to](https://dev.to/sleeyax/how-to-get-rid-of-fake-followers-on-x-twitter-4o1g) for a detailed guide with screenshots on how to use this extension. 

In short, follow these steps:

1. [Install the extension](#installation) and pin it to your browser toolbar for easy access.
2. After installing the extension for the first time, navigate to https://x.com/home at least once. This step is **crucial** for the extension to initialize itself. You will gracefully receive an error message if you forget this step.
3. Open the extension and click 'scan' to analyze your followers list for unwanted accounts.
4. Select the accounts you want to get rid of and then click the 'block' button at the top.
5. Go grab a drink while the extension blocks all of the accounts you selected. This action can take a while depending on the amount of followers your selected and the configured timeout in the extension settings.

You can fully customize the extension to your needs by right clicking the extension icon in Chrome (or click the 3-dots menu icon if you didn't pin the extension yet) and selecting 'Options'.

## FAQ

**Can I get in trouble for using this extension?**

No, this extension is designed to help you block fake followers and bots on X. At the time of writing, it does not violate X's TOS. However, it is important to note that the extension is not perfect and may block real users by mistake. Misconfiguration of the timeout settings may also result in temporary rate limits imposed on your account. Use this extension at your own discretion.

**Do you support [browser name]?**

Currently, only Chromium-based browsers (i.e. Chrome, Edge, Brave etc.) are supported. However, we are working on adding support for other browsers in the future. See the [project issues](https://github.com/sleeyax/x-bot-sweeper/issues?q=sort%3Aupdated-desc+is%3Aissue+is%3Aopen) tab to keep track of progress.

## Info for developers
Skip this section if you are not interested in contributing to this project.

### Development

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

At the time of writing, Node.js v20 is **required** to run this project without [weird build issues](https://github.com/PlasmoHQ/plasmo/issues/1060). Please install [nvm](https://github.com/nvm-sh/nvm) to make managing Node versions easier and then run `nvm use` at the root of this project to switch to the supported version. We also strongly recommend you to use [pnpm](https://pnpm.io/) as your package manager, as it is the one we use to develop and test this project and npm has caused issues with Plasmo in the past.

Then, make sure your have the dependencies installed:

```bash
$ pnpm install
```

Finally, start the development server:

```bash
$ pnpm dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To change the options page, simply change the `options.tsx`.

For further guidance, [visit the Plasmo Documentation](https://docs.plasmo.com/)

### Production

Run the following:

```bash
$ pnpm build
```

This should create a production bundle for the extension, ready to be zipped and published to the stores.

### Publish to Webstores

The easiest way to deploy the Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!

## License
This project is licensed under the [GNU General Public License v3.0](./LICENSE).
