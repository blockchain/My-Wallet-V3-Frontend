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

If you use the mock (see below) it will work out of the box. Just visit [local.blockchain.com:8080](http://local.blockchain.com:8080/).

If you want to use it with a real wallet then you need to login at http://blockchain.info/ first and whitelist your IP address.

## Usage

You can open any wallet registered with your email address as long as your IP is whitelisted. It will be upgraded to HD automatically. You can also sign up for a new wallet.

After login, you'll see a list of accounts. There will be delay before transactions and the correct balances show up. If something goes wrong during the login process, error messages appear in the console. 

The first time you login your browser needs to be verified. There's no UI for this yet, but you will receive an email with an approval link; once you click that login should proceed as normal.

To automatically login after every page refresh, create a file `.env` and add `SAVE_PASSWORD=1` to it.

To reclaim funds from an email take code at the of link and add it to `#/claim`, e.g.:

    https://blockchain.info/wallet/claim#7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK
    http://local.blockchain.com:8080/#/claim/7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK

Make sure that SAVE_PASSWORD is not enabled.


## Test

You may need to install PhantomJS seperately. On a Mac:

    brew install phantomjs

To run test and monitor for changes:

    npm test

## Development
Grunt keeps an eye on things in the background. In particular it compiles the Jade files whenever you change them.

## MyWallet mock

MyWallet can simulated using a mock, allowing you to login with fake credentials and simulate sending and receiving bitcoins. 

* Login with username `test` and password `test` to see some existing transactions.
* Create an account with any username and password; they will be stored in a cookie
* The first time you visit the mobile wallet transaction screen, it will simulate an incoming transaction paying for coffee after 3 seconds.
* If you make a payment request, 10 seconds after you stop editing, it will simulate the payment of 1 BTC.
* If you entered a lower or higher amount it will show the appropriate warnings. 
* If the simulated payment was insufficient and you leave the modal window open, after 10 seconds it will add the missing funds.

To use the mock create a file `.env` with `MOCK=1` at the top, restart the server and logout.

## Testnet

Not supported by the server yet.

## Deploy

Curently the app is configured to be deployed on Heroku and on a Blockchain staging server:

* Real money: http://dev.blockchain.info/ (VPN or IP whitelist, might not work at the moment)
* Mock: http://pure-wildwood-5818.herokuapp.com/ (not always up to date)

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