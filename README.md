# My-Wallet-HD-Frontend
A.k.a. angular-blockchain-wallet.

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ git clone git@github.com:blockchain/My-Wallet-HD-Frontend.git # or clone your own fork
$ cd My-Wallet-HD-Frontend
$ npm install
$ npm start
```

Visit [localhost:3012](http://localhost:3012/).

You need to disable your browser CORS security for the time being, e.g. with this [Chrome plugin](https://chrome.google.com/webstore/detail/allow-control-allow-origi/nlfbmbojpeacfghkpbjhddihlkkiljbi?hl=en-US).

## Deploy

Curently the app is configured to be deployed on Heroku:

http://morning-mesa-2022.herokuapp.com/

## Usage

After loading the page and disabling CORS security you can open any wallet. Demo wallet:

| UID | Password |
------|-----------
| 78019bee-7a27-490b-ab8a-446c2749bf1f | 1234567890 |

After login, you'll see a list of addresses. If something goes wrong during the login process, error messages will appear in the console.
