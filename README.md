# MyWallet HD Frontend
An AngularJS bitcoin web wallet powered by Blockchains [MyWallet](https://github.com/blockchain/My-Wallet-HD).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone --recursive https://github.com/blockchain/My-Wallet-HD-Frontend.git 
$ cd My-Wallet-HD-Frontend
$ npm install
$ npm start
```

Visit [localhost:3012](http://localhost:3012/).

If you use the mock (see below) it will work out of the box. If you want to use it with real bitcoins then you need to disable your browser CORS security (for the time being), e.g. with this [Chrome plugin](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en-US). You'll see a red icon with CORS. Click on it to make it green. Click on it again before you visit your banks website...

## Usage

After loading the page and disabling CORS security you can open any wallet. Demo wallet:

| UID | Password |
------|-----------
| 78019bee-7a27-490b-ab8a-446c2749bf1f | 1234567890 |

After login, you'll see a list of addresses. If something goes wrong during the login process, error messages will appear in the console.

You can add new addresses to your wallet, but they will not be saved to the server.

To automatically login after every page refresh, create a file `.env` and add `SAVE_PASSWORD=1` to it.

## Test

You may need to install PhantomJS seperately. On a Mac:

    brew install phantomjs

To run test and monitor for changes:

    npm test

## MyWallet mock

MyWallet can simulated using a mock, allowing you to login with fake credentials and simulate sending and receiving bitcoins. 

* Five seconds after login it will simulate an incoming transaction paying for coffee. 
* If you make a payment request, 10 seconds after you stop editing, it will simulate the payment of 1 BTC.
* If you entered a lower or higher amount it will show the appropriate warnings. 
* If the simulated payment was insufficient and you leave the modal window open, after 10 seconds it will add the missing funds.

To use the mock you need to add an environment variable MOCK=1. Create a file `.env` with `MOCK=1` at the top.

## Testnet

Not supported by the server yet.

## Deploy

Curently the app is configured to be deployed on Heroku:

* Real money: http://morning-mesa-2022.herokuapp.com/
* Mock: http://pure-wildwood-5818.herokuapp.com/

## Dependencies

* MyWallet: use `git pull` inside `assets/js/mywallet` to get the latest version. The tests use a mock for MyWallet, so you need to manually test if everything still works, including all edge cases.
* jsqrcode: uses a fork which was modified not to extend Array.prototype. The original repository seems dormant, but a pull request should be made if it becomes active again and we need their latest changes.