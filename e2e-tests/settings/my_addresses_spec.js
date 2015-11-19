describe('my-addresses-page', function() {

    // Required JS files
    var login = require('../ignore.js');
    var util = require('../util.js');


    beforeEach(function() {

        util.getURL();
        util.logIn();
        util.validateHome();

        // Navigate to Settings and validate page
        browser.findElement(by.css('[translate="SETTINGS"]')).click();
        browser.findElement(by.css('[translate="WALLET_SETTINGS_EXPLAIN"]'));

        // Navigate to Wallet Settings and validate page
        browser.findElement(by.css('[translate="MY_ADDRESSES"]')).click();
        browser.findElement(by.css('[translate="MY_ADDRESSES_EXPLAIN"]'));

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });

    xit('should have page elements', function() {

    });

});
