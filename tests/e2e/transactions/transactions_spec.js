describe('transactions-spec', function() {

    var login = require('../login_ignore.js');

    beforeEach(function() {
        // All steps on Beta Key page must use 'browser.driver.' because page does not contain AngularJS
        browser.driver.get('https://bcwallet:sgzGcOzZoRqQ0bHN@dev.blockchain.info');
        // Invite code page
        expect(browser.driver.getTitle()).toEqual('My Wallet HD Beta');
        browser.driver.findElement(by.css('input.form-control')).clear();
        browser.driver.findElement(by.css('input.form-control')).sendKeys(login.betaKey);
        browser.driver.findElement(by.css('input.btn.btn-primary.btn-login')).click();

        // Log in page
        expect(browser.getTitle()).toEqual('Blockchain Wallet HD');
        element(by.model('uid')).clear();
        element(by.model('password')).clear();
        element(by.model('uid')).sendKeys(login.uid);
        element(by.model('password')).sendKeys(login.pw);
        element(by.buttonText('Login')).click();
        // Login sleep (find a way to remove sleep)
        browser.sleep(1000);
        browser.findElement(by.buttonText('Request'));
        browser.findElement(by.buttonText('Send'));
        // This timeout is required as of 4/10/2015 to avoid 'There are changes still being saved' alert
        browser.sleep(4000);
    });

    afterEach(function() {
        browser.sleep(2000);
    });

    it('should log out via the "Log Out" button', function() {
        //// This timeout is required as of 4/10/2015 to avoid 'There are changes still being saved' alert
        //browser.sleep(4000);
        element(by.cssContainingText('a.dropdown-toggle.profile.ng-scope', 'Profile')).click();
        element.all(by.cssContainingText('a.ng-scope', 'Logout')).first().click();
        browser.switchTo().alert().accept();

        // Waiting for these log in page elements, Protractor waits 5 seconds until 'Logged Out' message dismisses
        browser.sleep(1000);
        browser.findElement(by.cssContainingText('label.control-label.col-md-3.ng-scope', 'UID'));
        browser.findElement(by.model('uid'));
        browser.findElement(by.cssContainingText('label.control-label.col-md-3.ng-scope', 'Password'));
        browser.findElement(by.model('password'));
    })

    it('should validate account names and balances', function() {
        browser.findElement(by.cssContainingText('a.ng-scope', 'All Accounts'));
        browser.findElement(by.cssContainingText('a.ng-binding', 'Spending'));
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 1'));
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 2'));

        // Without specific IDs, need this to prevent "more than one element found for locator" warning
        browser.findElement(by.cssContainingText('body > div > div > div > div > div > div > div > table > tbody > tr > td > a > span > span > span.ng-binding.ng-isolate-scope', '$0.00'));
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 3'));
        browser.findElement(by.cssContainingText('span.ng-binding.ng-hide', '0.00042116 BTC'));
    });

    it('should show account balance and transaction history when selecting account name', function() {
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 3')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', '0.00042116 BTC'));
        browser.findElement(by.cssContainingText('date.ng-binding', 'February 18 @ 06:56 PM'));
    });

    it('should show transaction details when clicking on date/time of transaction', function() {
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 3')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', '0.00042116 BTC'));
        browser.findElement(by.cssContainingText('date.ng-binding', 'February 18 @ 06:56 PM')).click();
        browser.findElement(by.cssContainingText('h2', 'Transaction Details'));
        browser.findElement(by.cssContainingText('h4', 'Value at time of send'));
        browser.sleep(200);
        browser.findElement(by.cssContainingText('div > span > span > span.ng-binding.ng-isolate-scope', '$0.10'));
        browser.findElement(by.cssContainingText('h4', 'Value now'));
        browser.findElement(by.cssContainingText('a.btn', 'Verify On Blockchain.info'));
    });

    it('should return to account balance and transaction history from transaction details', function() {
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 3')).click();
        browser.findElement(by.cssContainingText('date.ng-binding', 'February 18 @ 06:56 PM')).click();
        browser.findElement(by.cssContainingText('h2', 'Transaction Details')).click();
        browser.findElement(by.cssContainingText('button.left-arrow.white.ng-scope', 'Request'));
        browser.findElement(by.cssContainingText('button.right-arrow.blue.ng-scope', 'Send'));
    });

    it('should show transacted bitcoin address for each listed transaction', function() {
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 1')).click();
        browser.findElement(by.cssContainingText('date.ng-binding', 'April 7 @ 03:51 PM'));
        browser.findElement(by.cssContainingText('span.destination.hidden-sm.hidden-xs.ng-scope', '1DPrsgPctXtgN1GQcshPJhwEYr7xykWpVJ'));
        browser.findElement(by.cssContainingText('span.destination.hidden-sm.hidden-xs.ng-scope', '1H5Me956D9N39tbq8hFBJiBc6dJbRaAmxe'));
    });

    it('should auto populate account name on Send/Receive modal', function() {
        browser.findElement(by.cssContainingText('a.ng-binding', 'DONT EDIT 1')).click();
        browser.findElement(by.cssContainingText('button.right-arrow.blue.ng-scope', 'Send')).click();
        browser.findElement(by.cssContainingText('span.ng-scope', 'Send From'));
        browser.sleep(5000);
        browser.findElement(by.cssContainingText('span.ng-binding.ng-scope', 'DONT EDIT 1 (0.00077847 BTC)'));
        browser.findElement(by.cssContainingText('button.btn.btn-info.ng-scope', 'Cancel')).click();
        // Sleep for modal to dismiss
        browser.sleep(500);
        browser.findElement(by.cssContainingText('button.left-arrow.white.ng-scope', 'Request')).click();
        browser.findElement(by.cssContainingText('label.col-sm-3.control-label.ng-scope', 'Receive To:'));
        browser.findElement(by.cssContainingText('span.ng-binding.ng-scope', 'DONT EDIT 1'));
        browser.findElement(by.cssContainingText('button.btn.btn-info.ng-scope', 'Close')).click();
    });

});