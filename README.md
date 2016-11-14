# Blockchain.info Wallet [![Build Status](https://travis-ci.org/blockchain/My-Wallet-V3-Frontend.png?branch=master)](https://travis-ci.org/blockchain/My-Wallet-V3-Frontend) [![Coverage Status](https://coveralls.io/repos/blockchain/My-Wallet-V3-Frontend/badge.svg?branch=master&service=github)](https://coveralls.io/github/blockchain/My-Wallet-V3-Frontend?branch=master)

Be Your Own Bank at [blockchain.info/wallet](https://blockchain.info/wallet). Please [contact support](http://blockchain.zendesk.com/) if you have any issues using the wallet.

## Run the wallet on your own computer

The normal and easiest way to use our wallet is to go to [blockchain.info/wallet](https://blockchain.info/wallet). However if you like more control over the exact code that runs in your browser, you can download the source code and run the wallet from a simple server on your own machine. Here's how:

 1. Install [Node.js](http://nodejs.org/)
 2. `git clone git@github.com:blockchain/My-Wallet-V3-Frontend.git -b v1.7.32 --single-branch --depth 1`
 3. `make server`

Login to your existing wallet or create a new one at `http://localhost:8080/`.

You can replace `v1.7.32` with any tagged version you like, but we recommend always using the latest [release](https://github.com/blockchain/My-Wallet-V3-Frontend/releases). The versions marked as pre-release have not gone through extensive internal testing yet.

Note that the wallet itself is still stored on Blockchain.info servers. It is encrypted with your password. The wallet also uses the Blockchain.info servers to show you your balance, notify you of new payments, submit transactions, etc.

## About

The frontend code in this repository uses AngularJS. The Bitcoin specific tasks are handled by [My-Wallet-V3](https://github.com/blockchain/My-Wallet-V3), which is included via Bower.

## Develop

Make sure you have [Node.js](http://nodejs.org/) installed.

You also need Sass (use `sudo` if you're not using a [Ruby version manager](https://rvm.io)):
```sh
gem install sass
```

Install dependencies:
```sh
npm install
```

Create a file called `.env` in the root of the project. Put the following in it:

```
ROOT_URL=https://blockchain.info
```

Optionally you can add:

```
AUTO_RELOAD=1
WEB_SOCKET_URL=wss://ws.blockchain.info/inv
API_DOMAIN=https://api.blockchain.info
```

## Build

Grunt watches and compiles the Jade view templates and CSS. Keep it running:
```sh
grunt
```

## Test

To run test and monitor for changes:
```sh
npm test
```

A coverage report is generated after you run the test for the first time. Just open `coverage/index.html` in your browser.

## Run

Run local http server:
```sh
npm start
```

Visit [localhost:8080](http://localhost:8080/).

## Developing My-Wallet-V3

If you are making changes to [My-Wallet-V3](https://github.com/blockchain/My-Wallet-V3) that you want to try out in the frontend, create a symlink:
```sh
rm My-Wallet-V3-Frontend/bower_components/blockchain-wallet/dist/my-wallet.js
ln -s ../../../../My-Wallet-V3/dist/my-wallet.js My-Wallet-V3-Frontend/bower_components/blockchain-wallet/dist/my-wallet.js
```

To automatically login and go back to where you last were in the app after every page refresh, create a file `.env` and add `AUTO_RELOAD=1` to it.

If you enable "handle bitcoin links" in your wallet settings, you can open bitcoin URI's like this one:

    bitcoin:?address=1FeerpCgswvGRLVKme759C96DUBtf7SvA2?amount=0.01

## Contribute

Bug fixes and feedback on our code is always appreciated.

## Security

Security issues can be reported to us in the following venues:

 * Email: security@blockchain.info
 * Bug Bounty: https://www.crowdcurity.com/blockchain-info
