describe('my-details-page', function() {

    // Required JS files
    var login = require('../ignore.js');
    var util = require('../util.js');

    // My Details specific variables
    var passwordHintCSS = '[translate="PASSWORD_HINT"]';

    beforeEach(function() {

        util.getURL();
        util.logIn();
        util.validateHome();

        // Navigate to Settings and validate page
        browser.findElement(by.css('[translate="SETTINGS"]')).click();
        browser.findElement(by.css('[translate="WALLET_SETTINGS_EXPLAIN"]'));

        // Navigate to My Details and validate page
        browser.findElement(by.css('[translate="PREFERENCES"]')).click();

        // Click is to bring focus to scrollable portion of page
        browser.findElement(by.css('[translate="PREFERENCES_EXPLAIN"]')).click();

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });


    it('should have wallet password elements', function() {

        // Scroll to password hint section
        util.scrollTo(passwordHintCSS);


        // Validate password elements
        browser.findElement(by.css('[translate="WALLET_PASSWORD"]'));
        browser.findElement(by.css('[translate="WALLET_PASSWORD_EXPLAIN"]'));
        browser.findElement(by.css('[translate="PASSWORD_SET"]'));

    });

    it('should have a wallet password modal', function() {

        // Scroll to password hint section
        util.scrollTo(passwordHintCSS);

        // Click Change Button
        browser.findElement(by.css('[translate="CHANGE"]')).click();

        // Validate modal open
        browser.findElement(by.css('.modal-content'));

        // Validate modal elements
        browser.findElement(by.css('[translate="CURRENT_PASSWORD"]'));
        browser.findElement(by.css('[translate="NEW_PASSWORD"]'));
        browser.findElement(by.css('[translate="CONFIRM_PASSWORD"]'));

    });

    it('should change the wallet password hint', function() {

        // Bring focus to scrollable portion
        browser.findElement(by.css('[translate="UID"]')).click();

        // Validate password hint elements
        browser.findElement(by.css(passwordHintCSS));
        browser.findElement(by.css('[translate="PASSWORD_HINT_EXPLAIN"]'));

        // Scroll to password hint section
        util.scrollTo(passwordHintCSS);

        // Set new password hint
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-click="edit()"]')).click();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).clear();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).sendKeys('new password hint');
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[type="submit"]')).click();
        browser.sleep(1000);
        util.shouldContainCSS('h2.status', 'new password hint');

        // Reset old password hint
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-click="edit()"]')).click();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).clear();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).sendKeys('original password hint');
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[type="submit"]')).click();
        browser.sleep(1000);
        util.shouldContainCSS('h2.status', 'original password hint');

    });

});
