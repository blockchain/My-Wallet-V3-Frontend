# MyWallet V3 Frontend [![Build Status](https://travis-ci.org/blockchain/My-Wallet-V3-Frontend.png?branch=master)](https://travis-ci.org/blockchain/My-Wallet-V3-Frontend) [![Coverage Status](https://coveralls.io/repos/blockchain/My-Wallet-V3-Frontend/badge.svg?branch=master&service=github)](https://coveralls.io/github/blockchain/My-Wallet-V3-Frontend?branch=master)

An AngularJS bitcoin web wallet powered by [My-Wallet-V3](https://github.com/blockchain/My-Wallet-V3).

This is the new and improved wallet. You can see it at [alpha.blockchain.info](https://alpha.blockchain.info/). For the original wallet at [blockchain.info](https://blockchain.info/) please see [this repository](https://github.com/blockchain/My-Wallet) or [contact support](http://blockchain.zendesk.com/).

## Setup

Make sure you have [Node.js](http://nodejs.org/) installed.

Some NodeJS components need to be installed system wide:
```sh
npm install -g grunt-cli coffee-script
```

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
WEBSOCKET_URL=wss://blockchain.info/inv
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

## Usage

You can open any wallet registered with your email address. It will ask you to upgrade to HD if needed. You can also sign up for a new wallet.

After login, you'll see a list of accounts. There will be delay before transactions and the correct balances show up. If something goes wrong during the login process, error messages appear in the console.

To automatically login and go back to where you last were in the app after every page refresh, create a file `.env` and add `AUTO_RELOAD=1` to it.

To reclaim funds from an email take code at the of link and add it to `#/claim`, e.g.:

    https://blockchain.info/wallet/claim#7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK
    http://localhost:8080/#/claim/7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK

If you enable "handle bitcoin links" in your wallet settings, you can open bitcoin URI's like this one:

    bitcoin:?address=1FeerpCgswvGRLVKme759C96DUBtf7SvA2?amount=0.01

## Contribute

Did you know you can [sign your commits](https://git-scm.com/book/tr/v2/Git-Tools-Signing-Your-Work) using a PGP key?

## Testnet

Not supported by the server yet.

## Security

Security issues can be reported to us in the following venues:

 * Email: security@blockchain.info
 * Bug Bounty: https://www.crowdcurity.com/blockchain-info
