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
cd my-wallet
npm install
grunt build
```

cd back into the root of the directory
```sh
cd ~/path/to/My-Wall-HD-Frontend
```

Grunt compiles the view templates and CSS. Keep it running:
    
    grunt

Run the server:
```sh 
npm start
```

Visit [local.blockchain.com:8080](http://local.blockchain.com:8080/).  Do not use `localhost:8080`. You will need to modify your "hosts" file (`/etc/hosts` on OSX and most UNIX systems) because this is no longer registered at the DNS level for application security reasons. Add this line to `/etc/hosts`:

    127.0.0.1   local.blockchain.com

## Use Beta Invites Locally

To enable the beta invite functionality, create a file called `.env` and add the following to it:
`INVITE=1`
`BETA_DATABASE_PATH=betakeys.MDF`
`ADMIN_PASSWORD=...`

Copy the database file template (`betakeys.MDF` is ignored by git):
```sh
cp betakeys-template.MDF betakeys.MDF  
```

You should see a number of example users at:
http://local.blockchain.com:8080/betaadmin/

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

    Spender(null, function(){console.log("success")}, function(){console.log("fail")},null,null).prepareFromAccount(0, 20000, 10000, function(fromAccount) { fromAccount.toEmail("sjors@blockchain.com") })

Or to a mobile number:

    ... { fromAccount.toMobile("+1.....") } ...

In `prepareFromAccount()` the first argument is the account index, the second the amount in satoshi and the third the mining fee.

## Test

You may need to install PhantomJS seperately. On a Mac:

    brew install phantomjs

To run test and monitor for changes:

    npm test

A coverage report is generated after you run the test for the first time. Just open `coverage/index.html` in your browser.

**UI Tests**

Protractor UI tests are currently running on https://dev.blockchain.info/ or http://local.blockchain.com. Choose instance in util.js. File with login credentials (ignore.js) will be distributed separately and placed in the `e2e-tests` folder.

Install Protractor globally:

    npm install -g protractor

This installs both protractor and webdriver-manager. Update webdriver-manager:

    webdriver-manager update

Start up a server:

    webdriver-manager start

Open a new Terminal tab, navigate to the e2e test folder, and begin the tests:

    cd e2e-tests/
    protractor config.js

## Development
Grunt keeps an eye on things in the background. In particular it compiles the Jade files whenever you change them. So make sure it's running:

    grunt

## Testnet

Not supported by the server yet.

## Deploy

First create a minified javascript file for the MyWalletHD component:

    cd assets/js/my-wallet
    grunt dist

If you get 403 error from Github (because you exceeded their rate limit), try:

    GITHUB_USER=... GITHUB_PASSWORD=... grunt dist

If you don't care about securely downloading dependencies and want to avoid using your Github credentials, use `grunt dist_unsafe` instead.

Return to the root of the frontend project:

    cd ../../..

Create a static HTML/JS/CSS distribution package in `dist`. You must use your Github credentials here, because some packages are private:

    grunt dist

Alternatively use `grunt dist_unsafe` without Github credentials.

You can test the resulting files by setting `DIST=1` in `.env` and restarting the server.

Deploy to staging 

    grunt deploy_to_staging

index.html should be cached using If-Modified-Since or etag. All other files contain a hash of their content and should be cached forever.

## Git branches

* `master` : where the action is
* `staging` : I try to keep this in sync with dev.blockchain.info (and hopefully Travis will take care of that the other way around in the future)
* `send-to-email-mobile` : UI of sending to email / mobile (works but pending product feedback, a second dev server, etc)
* `ticker` : a feature Justin worked on, same status as send-to-email-mobile
* `experimental` : a brach we can use to deploy features that we aren't sure about yet, such as send-to-email-mobile. This branch can be recreated by combining other feature branches.
