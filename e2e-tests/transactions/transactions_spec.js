describe('transactions-page', function() {

    // Required JS files
    var login = require('../ignore.js');
    var util = require('../util.js');

    // Account name variables
    var account1Name = 'DONT EDIT 1';
    var account2Name = 'DONT EDIT 2';
    var account3Name = 'DONT EDIT 3';
    var account4Name = 'Spending';

    // Account transaction value variables
    var account1TransValue = '0.00087847 BTC';
    var account1TransValueTx = '0.00077847 BTC';
    var account3TransValue = '0.00042116 BTC';
    var account3TransLocationPage = 'h1.ng-binding';

    // Account date variables
    var account1TransDate = 'April 7 @ 03:51 PM';
    var account3TransDate = 'February 18 @ 06:56 PM';


    beforeEach(function() {

        util.getURL();
        util.logIn();
        util.validateHome();

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });

    it('should log out via the "Log Out" button', function() {

        // Open Profile drop down menu, click Logout, and dismiss alert
        util.logOut();

        // Protractor waits 5 seconds until 'Logged Out' message dismisses

        // Find UID label and text field
        browser.sleep(4000); //Required wait for UID field
        browser.findElement(by.css('[translate="UID"]'));
        browser.findElement(by.model('uid'));

        // Find password label and text field
        browser.findElement(by.css('[translate="PASSWORD"]'));
        browser.findElement(by.model('password'));

        // Find login and create wallet buttons
        browser.findElement(by.id('login'));
        browser.findElement(by.css('[ng-click="register()"]'));

    });

    it('should validate account names and balances', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Validate all account names
        browser.findElement(by.css('[translate="ALL_ACCOUNTS"]'));
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account1Name);
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account2Name);
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account3Name);
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account4Name);

        // Validate two account balances
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account1TransValue);
        util.shouldContainCSS('[ng-repeat="account in accounts"]', account3TransValue);

    });

    it('should show account balance and transaction history when selecting account name', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on 4th account and validate value and date
        browser.element.all(by.repeater('account in accounts')).get(3).click();
        util.shouldContainCSS(account3TransLocationPage, account3TransValue);
        util.shouldContainCSS('date', account3TransDate);

    });

    it('should show transaction details when clicking on date/time of transaction', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on 4th account and validate value and date
        browser.element.all(by.repeater('account in accounts')).get(3).click()
        util.shouldContainCSS(account3TransLocationPage, account3TransValue);
        browser.findElement(by.cssContainingText('date', account3TransDate)).click();

        // Validate transaction details page
        browser.findElement(by.css('[translate="TRANSACTION_COMPLETE"]'));

        // TODO use translations and validate more items
        util.shouldContainCSS('p', 'Value at Send');
        browser.sleep(200); // Required for next step to pass in Chrome
        expect(element(by.cssContainingText('[btc="transaction.result"]', '$0.10')).isPresent()).toBe(true);
        util.shouldContainCSS('.tx-value', 'Value now');
        util.shouldContainCSS('a', 'Verify On Blockchain.info');

    });

    it('should return to account balance and transaction history from transaction details', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on 4th account in list and view transaction details
        browser.element.all(by.repeater('account in accounts')).get(3).click();
        browser.element.all(by.repeater("transaction in transactions | filter:transactionFilter | orderBy:'-txTime'")).get(0).click();

        // Return to account details and validate Request/Send buttons
        browser.findElement(by.css('h4.back')).click();
        browser.findElement(by.css('[translate="REQUEST"]'));
        browser.findElement(by.css('[translate="SEND"]'));

    });

    it('should show transacted bitcoin address for each listed transaction', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 1' and validate transaction date
        browser.element.all(by.repeater('account in accounts')).get(1).click();
        util.shouldContainCSS('date.ng-binding', account1TransDate);

        // Validate  address labels within account details
        browser.findElement(by.css('[translate="1FV6M8WSJLRKECvGzXwVZyfRgdVHxZmjrX"]'));
        browser.findElement(by.css('[translate="1DPrsgPctXtgN1GQcshPJhwEYr7xykWpVJ"]'));
        browser.findElement(by.css('[translate="1H5Me956D9N39tbq8hFBJiBc6dJbRaAmxe"]'));

    });

    it('should auto populate account name on Send/Receive modal', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 1' and validate transaction date
        browser.element.all(by.repeater('account in accounts')).get(1).click();
        browser.findElement(by.css('[translate="SEND"]')).click();

        // Validate Send modal details
        browser.findElement(by.css('[translate="FROM:"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name + ' (' + account1TransValueTx + ')');

        // Close Send modal, wait for and click Request button
        browser.findElement(by.css('[ng-click="close()"]')).click();
        expect(element(by.css('[ng-click="request()"]')).isPresent()).toBe(true);
        browser.findElement(by.css('[translate="REQUEST"]')).click();

        // Validate Receive modal details
        browser.findElement(by.css('[translate="RECEIVE_TO"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name);
        browser.findElement(by.css('[ng-click="close()"]')).click();

    });

    it('should filter by transcation type', function() {

      util.navigateTo("MY_TRANSACTIONS");
      element.all(by.css('.filter-bar')).all(by.css('[translate="SENT_BITCOIN_TO"]')).click();
      browser.sleep(1000);
      expect(element.all(by.css('.transaction-feed')).all(by.css('[translate="RECEIVED_BITCOIN_FROM"]')).count()).toEqual(0);


      element.all(by.css('.filter-bar')).all(by.css('[translate="RECEIVED_BITCOIN_FROM"]')).click();
      expect(element.all(by.css('.transaction-feed')).all(by.css('[translate="MOVE_BITCOIN_TO"]')).count()).toEqual(0);

    });

});
