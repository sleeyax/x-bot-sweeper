# x-bot-sweeper
Browser extension to automatically remove bot accounts from your followers on Twitter / X.

This is a [Plasmo extension](https://docs.plasmo.com/) project bootstrapped with [`plasmo init`](https://www.npmjs.com/package/plasmo).

## Development

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

## Production

Run the following:

```bash
$ pnpm build
```

This should create a production bundle for the extension, ready to be zipped and published to the stores.

### Publish to Webstores

The easiest way to deploy the Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!
