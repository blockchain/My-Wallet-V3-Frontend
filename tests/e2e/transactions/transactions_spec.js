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

        // Validate account homepage details
        browser.sleep(1000); // Required wait for Request and Send button validation
        browser.findElement(by.css('[ng-click="send()"]'));

        //////////////////////////////////////////////////////////
        //  This excessive timeout is required as of 4/10/2015  //
        // to avoid 'There are changes still being saved' alert //
        //    Caused by a bug that triggers a wallet backup     //
        //////////////////////////////////////////////////////////
        browser.sleep(4000);

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

        // Validate all account names
        browser.findElement(by.css('[translate="ALL_ACCOUNTS"]'));
        util.shouldContainCSS('a.ng-binding', account1Name);
        util.shouldContainCSS('a.ng-binding', account2Name);
        util.shouldContainCSS('a.ng-binding', account3Name);
        util.shouldContainCSS('a.ng-binding', account4Name);

        // Validate two account balances
        util.shouldContainCSS('body > div > div > div > div > div > div > div > table > tbody > tr > td > a > span > span > span.ng-binding.ng-isolate-scope', '0.00');
        util.shouldContainCSS('span.ng-binding.ng-hide', account3TransValue);

    });

    it('should show account balance and transaction history when selecting account name', function() {

        // Click on account 'DONT EDIT 3' and validate value and date
        browser.findElement(by.cssContainingText('a.ng-binding', account3Name)).click();
        util.shouldContainCSS('p.ng-binding', account3TransValue);
        util.shouldContainCSS('date.ng-binding', account3TransDate);

    });

    it('should show transaction details when clicking on date/time of transaction', function() {

        // Click on account 'DONT EDIT 3' and view transaction details
        browser.findElement(by.cssContainingText('a.ng-binding', account3Name)).click();
        util.shouldContainCSS('p.ng-binding', account3TransValue);
        browser.findElement(by.cssContainingText('date.ng-binding', account3TransDate)).click();

        // Validate transaction details page
        // TODO Change to translate="" after translations added
        util.shouldContainCSS('h2', 'Transaction Details');
        browser.findElement(by.css('[translate="VALUE_AT_TX_TIME"]'));
        browser.sleep(200); // Required for next step to pass in Chrome
        expect(element(by.cssContainingText('div > span > span > span.ng-binding.ng-isolate-scope', '$0.10')).isPresent()).toBe(true);
        util.shouldContainCSS('div > span > span > span.ng-binding.ng-isolate-scope', '$0.10');
        // TODO Change to translate="" after translations added
        util.shouldContainCSS('h4', 'Value now');
        // TODO Change to translate="" after translations added
        util.shouldContainCSS('a.btn', 'Verify On Blockchain.info');

    });

    it('should return to account balance and transaction history from transaction details', function() {

        // Click on account 'DONT EDIT 3' and view transaction details
        browser.findElement(by.cssContainingText('a.ng-binding', account3Name)).click();
        browser.findElement(by.cssContainingText('date.ng-binding', account3TransDate)).click();

        // Return to account details and validate Request/Send buttons
        browser.findElement(by.css('h2.back')).click();
        browser.findElement(by.css('[ng-click="request()"]'));
        browser.findElement(by.css('[ng-click="send()"]'));

    });

    it('should show transacted bitcoin address for each listed transaction', function() {

        // Click on account 'DONT EDIT 1' and validate transaction date
        browser.findElement(by.cssContainingText('a.ng-binding', account1Name)).click();
        util.shouldContainCSS('date.ng-binding', account1TransDate);

        // Validate  address labels within account details
        browser.findElement(by.css('[translate="1FV6M8WSJLRKECvGzXwVZyfRgdVHxZmjrX"]'));
        browser.findElement(by.css('[translate="1DPrsgPctXtgN1GQcshPJhwEYr7xykWpVJ"]'));
        browser.findElement(by.css('[translate="1H5Me956D9N39tbq8hFBJiBc6dJbRaAmxe"]'));

    });

    it('should auto populate account name on Send/Receive modal', function() {

        // View account 1 details and open Send modal
        browser.findElement(by.cssContainingText('a.ng-binding', account1Name)).click();
        browser.findElement(by.css('[ng-click="send()"]')).click();

        // Validate Send modal details
        browser.findElement(by.css('[translate="SEND_FROM"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name + ' (' + account1TransValue + ')');

        // Close Send modal, wait for and click Request button
        browser.findElement(by.css('[ng-click="close()"]')).click();
        expect(element(by.css('[ng-click="request()"]')).isPresent()).toBe(true);
        browser.findElement(by.css('[ng-click="request()"]')).click();

        // Validate Receive modal details
        browser.findElement(by.css('[translate="RECEIVE_TO"]'));
        util.shouldContainCSS('span.ng-binding.ng-scope', account1Name);
        browser.findElement(by.css('[ng-click="close()"]')).click();

    });

});