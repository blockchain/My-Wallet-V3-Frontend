# MyWallet HD Frontend
An AngularJS bitcoin web wallet powered by Blockchains [MyWallet](https://github.com/blockchain/My-Wallet-HD).

## Running Locally

Make sure you have [Node.js](http://nodejs.org/) installed.

Install Grunt:

    npm install -g grunt-cli

```sh
git clone https://github.com/blockchain/My-Wallet-HD-Frontend.git 
cd My-Wallet-HD-Frontend
npm install
```

Include My-Wallet-HD (which is shared between the web and iOs app):

```sh
cd assets/js
git clone https://github.com/blockchain/My-Wallet-HD.git my-wallet
npm install
grunt build
```

You may have to run `npm install` twice.

Grunt compiles the view templates and copies some CSS. Keep it running:

    grunt

Run the server:
```sh 
npm start
```

Visit [local.blockchain.com:8080](http://local.blockchain.com:8080/).  Do not use `localhost:8080`. You will need to modify your "hosts" (/etc/hosts on OSX and most UNIX systems) because this is no longer registered at the DNS level for application security reasons. Add this line to /etc/hosts:
127.0.0.1   local.blockchain.com

## Usage

You can open any wallet registered with your email address. It will ask you to upgrade to HD if needed.

You can also sign up for a new wallet. In that case you should use a valid email address. In the final registration step you need to enter the 5 letter code from the registration email (do not click the link).

If the login hangs indefinitely, try the following hack. In the root directory of My-Wallet-HD-Frontend, create a file with the name ".env" with the contents "DEBUG=1". Restart grunt and the webserver with "npm start".

After login, you'll see a list of accounts. There will be delay before transactions and the correct balances show up. If something goes wrong during the login process, error messages appear in the console. 

The first time you login your browser needs to be verified. There's no UI for this yet, but you will receive an email with an approval link; once you click that login should proceed as normal.

To automatically login after every page refresh, create a file `.env` and add `SAVE_PASSWORD=1` to it.

To reclaim funds from an email take code at the of link and add it to `#/claim`, e.g.:

    https://blockchain.info/wallet/claim#7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK
    http://local.blockchain.com:8080/#/claim/7Educ5YNnVPQCQ556w7W8tQpj1dchhxPK56vVNab68cK

If you enable "handle bitcoin links" in your wallet settings, you can open bitcoin URI's like this one:

    bitcoin:?address=1FeerpCgswvGRLVKme759C96DUBtf7SvA2?amount=0.01

There's no UI for this yet, but you can send bitcoins to an email address from the console:

    MyWallet.sendToEmail(0, 20000, 10000, "sjors@blockchain.com", function(){console.log('Done')}, function(e){console.log('Failed'); console.log(e)}, {dummy: false}, function(){ console.log("Second password required") })

Or to a mobile number:

    MyWallet.sendToMobile(0, 22000, 10000, "+.....", function(){console.log('Done')}, function(e){console.log('Failed'); console.log(e)}, {dummy: false}, function(){ console.log("Second password required") })


The first argument is the account index, the second the amount in satoshi and the third the mining fee.

## Test

You may need to install PhantomJS seperately. On a Mac:

    brew install phantomjs

To run test and monitor for changes:

    npm test

A coverage report is generated after you run the test for the first time. Just open `coverage/PhantomJS\ 1.9.8\ \(Mac\ OS\ X\)/index.html` in your browser.

## Development
Grunt keeps an eye on things in the background. In particular it compiles the Jade files whenever you change them. So make sure it's running:

    grunt

For easier debugging of MyWallet javascript, put `DEBUG=1` in your `.env` file.

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

First create a minified javascript file for the MyWalletHD component:

    cd assets/js/my-wallet
    grunt dist

If you get 403 error from Github (because you exceeded their rate limit), try:

    GITHUB_USER=... GITHUB_PASSWORD=... grunt dist

Return to the root of the frontend project:

    cd ../../..

Create a static HTML/JS/CSS distribution package in `dist`. You must use your Github credentials here, because some packages are private:

    grunt dist

You can test the resulting files with:

    coffee server-dist.coffee

Deploy to staging (assuming your host file has an entry server11):

    grunt staging

index.html should be cached using If-Modified-Since or etag. The assets which contain a hash of their content should be cached forever. The remaining assets (e.g. beep.wav and images): unsure.

## Dependencies

* MyWallet: use `git pull` inside `assets/js/mywallet` to get the latest version. The tests use a mock for MyWallet, so you need to manually test if everything still works.