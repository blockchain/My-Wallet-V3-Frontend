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
    var account1TransValue = '0.00077847 BTC';
    var account3TransValue = '0.00042116 BTC';

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
        util.shouldContainCSS('span.prs.ng-binding', account1Name);
        util.shouldContainCSS('span.prs.ng-binding', account2Name);
        util.shouldContainCSS('span.prs.ng-binding', account3Name);
        util.shouldContainCSS('span.prs.ng-binding', account4Name);

        // Validate two account balances
        util.shouldContainCSS('a > span > span > span.ng-binding.ng-isolate-scope.ng-hide', '0.00');
        browser.findElement(by.cssContainingText('span.ng-binding', account3TransValue));

    });

    it('should show account balance and transaction history when selecting account name', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 3' and validate value and date
        browser.findElement(by.cssContainingText('span.prs.ng-binding', account3Name)).click();
        util.shouldContainCSS('h1.ng-binding.ng-scope', account3TransValue);
        util.shouldContainCSS('date.ng-binding', account3TransDate);

    });

    it('should show transaction details when clicking on date/time of transaction', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 3' and validate value and date
        browser.findElement(by.cssContainingText('span.prs.ng-binding', account3Name)).click();
        util.shouldContainCSS('h1.ng-binding.ng-scope', account3TransValue);
        browser.findElement(by.cssContainingText('date.ng-binding', account3TransDate)).click();

        // Validate transaction details page
        // TODO Change to translate="" after translations added
        util.shouldContainCSS('strong', 'Transaction Details');

        browser.findElement(by.css('[translate="TRANSACTION_COMPLETE"]'));

        // TODO Change to translate="" after translations added
        util.shouldContainCSS('p', 'Value at Send');

        browser.sleep(200); // Required for next step to pass in Chrome
        expect(element(by.cssContainingText('div > span.ng-binding.ng-isolate-scope', '$0.10')).isPresent()).toBe(true);

        // TODO Change to translate="" after translations added
        util.shouldContainCSS('p', 'Value now');

        // TODO Change to translate="" after translations added
        util.shouldContainCSS('a.button-default.button-sm', 'Verify On Blockchain.info');

    });

    it('should return to account balance and transaction history from transaction details', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 3' and view transaction details
        browser.findElement(by.cssContainingText('span.prs.ng-binding', account3Name)).click();
        browser.findElement(by.cssContainingText('date.ng-binding', account3TransDate)).click();

        // Return to account details and validate Request/Send buttons
        browser.findElement(by.css( 'div > a > h2.back')).click();
        browser.findElement(by.css('[translate="REQUEST"]'));
        browser.findElement(by.css('[translate="SEND"]'));

    });

    it('should show transacted bitcoin address for each listed transaction', function() {

        // Open Transactions drawer in left navigation
        browser.findElement(by.css('[translate="MY_TRANSACTIONS"]')).click();

        // Click on account 'DONT EDIT 1' and validate transaction date
        browser.findElement(by.cssContainingText('span.prs.ng-binding', account1Name)).click();
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
        browser.findElement(by.cssContainingText('span.prs.ng-binding', account1Name)).click();
        browser.findElement(by.css('[translate="SEND"]')).click();

        // Validate Send modal details
        browser.findElement(by.css('[translate="FROM"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name + ' (' + account1TransValue + ')');

        // Close Send modal, wait for and click Request button
        browser.findElement(by.css('[ng-click="close()"]')).click();
        expect(element(by.css('[ng-click="request()"]')).isPresent()).toBe(true);
        browser.findElement(by.css('[translate="REQUEST"]')).click();

        // Validate Receive modal details
        browser.findElement(by.css('[translate="RECEIVE_TO"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name);
        browser.findElement(by.css('[ng-click="close()"]')).click();

    });

});