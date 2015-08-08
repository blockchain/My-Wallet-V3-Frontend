describe('login-page', function() {

    // Required JS files
    var login = require('../ignore.js');
    var util = require('../util.js');

    // These are log in fields
    var loginUIDField = browser.element(by.model('uid'));
    var loginPasswordField = browser.element(by.model('password'));

    // These are create login fields
    var passwordField = element(by.model('fields.password'));
    var confField = element(by.model('fields.confirmation'));
    var emailField = element(by.model('fields.email'));

    // These are log in buttons
    var loginButton = element(by.id('login'));

    // Clear log in test fields
    var clearLoginFields = function (){
        loginUIDField.clear();
        loginPasswordField.clear();
    }

    // Click field, see invalid error, clear email field
    var validateInvalid = function(){
        passwordField.click();
        util.shouldContainCSS('p.ng-binding', 'Invalid');
        emailField.clear();
    }

    beforeEach(function() {

        util.getURL();

    });

    afterEach(function() {

        // Refresh to begin test on login page
        browser.refresh();

    });

    xit('should validate top navigation items', function() {

        browser.findElement(by.id('logo'));
        browser.findElement(by.linkText('Home'));
        browser.findElement(by.linkText('About'));
        browser.findElement(by.linkText('Wallet'));
        browser.findElement(by.linkText('Explorer'));
        browser.findElement(by.linkText('Merchant'));
        browser.findElement(by.linkText('Support'));

    });

    it('should have login page elements', function() {

        // Find UID label and text field
        browser.findElement(by.css('[translate="UID"]'));
        browser.findElement(by.model('uid'));

        // Find password label and text field
        browser.findElement(by.css('[translate="PASSWORD"]'));
        browser.findElement(by.model('password'));

        // Find login and create wallet buttons
        browser.findElement(by.id('login'));
        browser.findElement(by.css('[ng-click="register()"]'));

      });

    it('should test password strength', function() {

        util.submitBetaKey();

        // Test weak password
        passwordField.sendKeys(browser.params.login.pwweak);
        browser.findElement(by.css('.progress-bar-danger'));
        passwordField.clear();

        // Test regular password
        passwordField.sendKeys(browser.params.login.pwregular);
        browser.findElement(by.css('.progress-bar-warning'));
        passwordField.clear();

        // Test normal password
        passwordField.sendKeys(browser.params.login.pwnormal);
        browser.findElement(by.css('.progress-bar-info'));
        passwordField.clear();

        // Test strong password
        passwordField.sendKeys(login.pw);
        browser.findElement(by.css('.progress-bar-success'));
        passwordField.clear();

    });

    it('should test password matching', function() {

        // Enter  key and click Create Wallet button
        util.submitBetaKey();

        // Enter non-matching passwords
        passwordField.sendKeys(login.pw);
        confField.sendKeys(browser.params.login.pwweak);

        // Submit and validate error messaging
        passwordField.click();
        util.shouldContainCSS('p.ng-binding', 'Does not match');

        // Clear both fields
        passwordField.clear();
        confField.clear();

    });

    // Invite key pre-fills email address and disables editing, this test case is disabled
    xit('should test email address validation', function() {

        // Enter beta key and click Create Wallet button
        util.submitBetaKey();

        // Test email address with only letters
        emailField.sendKeys(browser.params.login.pwweak);
        validateInvalid();

        // Test email address with only numbers
        emailField.sendKeys(browser.params.login.nums);
        validateInvalid();

        // Test email address with only special characters
        emailField.sendKeys(browser.params.login.chars);
        validateInvalid();

    });

    it('should test unsuccessful login, invalid UID', function() {

        // Clear log in text fields
        clearLoginFields();

        // Enter bogus wallet identifier and password
        loginUIDField.sendKeys(browser.params.login.uidfake);
        loginPasswordField.sendKeys(login.pw);

        // Submit and validate error messaging
        loginButton.click();
        // TODO This element isn't being found
        //util.shouldContainCSS('alert.ng-isolate-scope.alert-danger.alert-dismissable', 'This wallet is not associated with a beta invite key.');

    });

    it('should test unsuccessful login, invalid password', function() {

        // Clear log in text fields
        clearLoginFields();

        // Enter valid wallet identifier and incorrect password
        loginUIDField.sendKeys(login.uid);
        loginPasswordField.sendKeys(browser.params.login.pwweak);

        // Submit and validate error messaging
        loginButton.click();
        browser.sleep(3000);
        util.shouldContainCSS('.help-block', 'Error Decrypting Wallet. Please check your password is correct.');

    });

});
