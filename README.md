# MyWallet HD Frontend
An AngularJS bitcoin web wallet powered by Blockchains [MyWallet](https://github.com/blockchain/My-Wallet-HD).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.

```sh
git clone --recursive https://github.com/blockchain/My-Wallet-HD-Frontend.git 
cd My-Wallet-HD-Frontend
npm install
```

Compile javascript for MyWallet:
```sh
cd assets/js/my-wallet
npm install
````

Grunt compiles the view templates and copies some CSS:

Install Grunt:

    npm install -g grunt-cli

Run it:

    grunt

Run the server:
```sh 
npm start
```

Visit [local.blockchain.com:8080](http://local.blockchain.com:8080/).  Do not use `localhost:8080`.

## Usage

You can open any wallet registered with your email address. It will ask you to upgrade to HD if needed.

You can also sign up for a new wallet. In that case you should use a valid email address. In the final registration step you need to enter the 5 letter code from the registration email (do not click the link).

After login, you'll see a list of accounts. There will be delay before transactions and the correct balances show up. If something goes wrong during the login process, error messages appear in the console. 

The first time you login your browser needs to be verified. There's no UI for this yet, but you will receive an email with an approval link; once you click that login should proceed as normal.

To automatically login after every page refresh, create a file `.env` and add `SAVE_PASSWORD=1` to it.

To reclaim funds from an email take code at the of link and add it to `#/claim`, e.g.:

    https://blockchain.info/wallet/claim#7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK
    http://local.blockchain.com:8080/#/claim/7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK

If you enable "handle bitcoin links" in your wallet settings, you can open bitcoin URI's like this one:

    bitcoin:?address=1FeerpCgswvGRLVKme759C96DUBtf7SvA2?amount=0.01

There's no UI for this yet, but you can send bitcoins to an email address from the console:

    MyWallet.sendToEmail(0, 100000, 10000, "sjors@blockchain.com", function(){console.log('Done')}, function(e){console.log('Failed'); console.log(e)})

The first argument is the account index, the second the amount in satoshi and the third the mining fee.

## Test

You may need to install PhantomJS seperately. On a Mac:

    brew install phantomjs

To run test and monitor for changes:

    npm test

## Development
Grunt keeps an eye on things in the background. In particular it compiles the Jade files whenever you change them. So make sure it's running:

    grunt

## MyWallet mock

MyWallet can simulated using a mock, allowing you to login with fake credentials and simulate sending and receiving bitcoins. 

* Login with username `test` and password `test` to see some existing transactions.
* Create an account with any username and password; they will be stored in a cookie
* If you make a payment request, 10 seconds after you stop editing, it will simulate the payment of 1 BTC.

To use the mock create a file `.env` with `MOCK=1` at the top, restart the server and logout.

The mock has limited functionality. It's main purpuse is to facilitate Jasmine tests and make it easier to tweak UI. Not every change is saved, not every setting is honored, etc..

## Testnet

Not supported by the server yet.

## Deploy

Curently the app is configured to be deployed on a Blockchain staging server:

https://dev.blockchain.info/ (password protected)

Create a static HTML/JS/CSS distribution package in `dist`:

    grunt dist

You can test the resulting files with:

    coffee server-dist.coffee

Deploy to staging (assuming your host file has an entry ssh.blockchain.com):

    grunt staging

index.html should be cached using If-Modified-Since or etag. The assets which contain a hash of their content should be cached forever. The remaining assets (e.g. beep.wav and images): unsure.

## Dependencies

* MyWallet: use `git pull` inside `assets/js/mywallet` to get the latest version. The tests use a mock for MyWallet, so you need to manually test if everything still works, including all edge cases.
* jsqrcode: uses a fork which was modified not to extend Array.prototype. The original repository seems dormant, but a pull request should be made if it becomes active again and we need their latest changes.