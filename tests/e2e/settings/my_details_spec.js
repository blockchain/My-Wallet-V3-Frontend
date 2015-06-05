describe('my-details-page', function() {

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

        // Navigate to My Details and validate page
        browser.findElement(by.css('[translate="MY_DETAILS"]')).click();

        // Click is to bring focus to scrollable portion of page
        browser.findElement(by.css('[translate="MY_DETAILS_EXPLAIN"]')).click();

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });

    it('should have wallet password elements', function() {

        // Scroll to password hint section
        util.scrollTo('a.button-muted.mtm.ng-binding', 'Change Password Hint');

        // Validate password elements
        browser.findElement(by.css('[translate="WALLET_PASSWORD"]'));
        browser.findElement(by.css('[translate="WALLET_PASSWORD_EXPLAIN"]'));
        util.shouldContainCSS('h2.status.complete.hidden-sm.hidden-xs.mbm.ng-scope', 'Password Set');

    });

    it('should have a wallet password modal', function() {

        // Scroll to password hint section
        util.scrollTo('a.button-muted.mtm.ng-binding', 'Change Password Hint');

        // Click Change Password Button
        browser.findElement(by.css('[translate="CHANGE_PASSWORD"]')).click();

        // Validate modal open
        browser.findElement(by.css('div.modal-content'));

        // Validate modal elements
        browser.findElement(by.css('[translate="CURRENT_PASSWORD"]'));
        browser.findElement(by.css('[translate="NEW_PASSWORD"]'));
        browser.findElement(by.css('[translate="CONFIRM_PASSWORD"]'));

    });

    it('should change the wallet password', function() {

        // Bring focus to scrollable portion
        browser.findElement(by.css('[translate="UID"]')).click();

        // Scroll to password hint section
        util.scrollTo('a.button-muted.mtm.ng-binding', 'Change Password Hint');

        // Open Change Password modal
        browser.findElement(by.css('[translate="CHANGE_PASSWORD"]')).click();

        // Validate modal open
        browser.findElement(by.css('div.modal-content'));

        // Enter current and new passwords
        element(by.model('fields.currentPassword')).sendKeys(login.pw);
        element(by.model('fields.password')).sendKeys(login.pwNew);
        element(by.model('fields.confirmation')).sendKeys(login.pwNew);
        browser.sleep(200);

        // Click Change Password button on modal
        browser.findElement(by.css('div.modal-content')).findElement(by.css('[ng-click="changePassword()"]')).click();
        browser.sleep(200);

        // Reopen Change Password modal
        browser.findElement(by.css('[translate="CHANGE_PASSWORD"]')).click();

        // Enter current and new passwords
        element(by.model('fields.currentPassword')).sendKeys(login.pwNew);
        element(by.model('fields.password')).sendKeys(login.pw);
        element(by.model('fields.confirmation')).sendKeys(login.pw);

        // Click Change Password button on modal
        browser.findElement(by.css('div.modal-content')).findElement(by.css('[ng-click="changePassword()"]')).click();
        browser.sleep(200);

        // Validate Password Set label
        util.shouldContainCSS('h2.status.complete.hidden-sm.hidden-xs.mbm.ng-scope', 'Password Set');

    });

    it('should change the wallet password hint', function() {

        // Bring focus to scrollable portion
        browser.findElement(by.css('[translate="UID"]')).click();

        // Validate password hint elements
        browser.findElement(by.css('[translate="PASSWORD_HINT"]'));
        browser.findElement(by.css('[translate="PASSWORD_HINT_EXPLAIN"]'));
        util.shouldContainCSS('h2.status.complete.hidden-xs.long-input.ng-binding', 'original password hint');

        // Scroll to password hint section
        util.scrollTo('a.button-muted.mtm.ng-binding', 'Change Password Hint');

        // Set new password hint
        // TODO use translate string once implemented
        browser.findElement(by.cssContainingText('a.button-muted.mtm.ng-binding', 'Change Password Hint')).click();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).clear();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).sendKeys('new password hint');
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[translate="Save"]')).click();
        browser.sleep(500);
        util.shouldContainCSS('h2.status.complete.hidden-xs.long-input.ng-binding', 'new password hint');

        // Set new password hint
        // TODO use translate string once implemented
        browser.findElement(by.cssContainingText('a.button-muted.mtm.ng-binding', 'Change Password Hint')).click();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).clear();
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[ng-model="form.newValue"]')).sendKeys('original password hint');
        browser.element(by.css('[ng-model="user.passwordHint"]')).element(by.css('[translate="Save"]')).click();
        browser.sleep(500);
        util.shouldContainCSS('h2.status.complete.hidden-xs.long-input.ng-binding', 'original password hint');

        // Reset old password hint

    });

});