describe('wallet-settings-page', function() {

    // Required JS files
    var login = require('../ignore.js');
    var util = require('../util.js');


    beforeEach(function() {

        util.getURL();
        util.logIn();
        util.validateHome();

        // Navigate to Settings and validate page
        browser.findElement(by.css('[translate="SETTINGS"]')).click();
        browser.findElement(by.css('[translate="WALLET_SETTINGS_EXPLAIN"]')).click();

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });

    it('should validate wallet language elements', function() {

        browser.findElement(by.css('[translate="LANGUAGE"]'));
        browser.findElement(by.css('[translate="LANGUAGE_EXPLAIN"]'));
        browser.findElement(by.css('[language="settings.language"]'));

    });

    it('should change language settings', function() {

        browser.findElement(by.css('[language="settings.language"]')).findElement(by.css('.ui-select-toggle')).click();


    });

});
