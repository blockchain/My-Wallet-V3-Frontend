describe('login-spec', function() {

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
    });

    it('should have login page elements', function() {
        browser.findElement(by.cssContainingText('label.control-label.col-md-3.ng-scope', 'UID'));
        browser.findElement(by.model('uid'));
        browser.findElement(by.cssContainingText('label.control-label.col-md-3.ng-scope', 'Password'));
        browser.findElement(by.model('password'));
        browser.findElement(by.buttonText('Login'));
        browser.findElement(by.cssContainingText('a.ng-scope', 'Create wallet'));
      });

    it('should test password strength', function() {
        element(by.cssContainingText('a.ng-scope', 'Create wallet')).click();
        element(by.model('fields.email')).sendKeys(browser.params.login.email);
        // Test weak password
        element(by.model('fields.password')).sendKeys(browser.params.login.pwweak);
        browser.findElement(by.cssContainingText('div.progress-bar.ng-binding.progress-bar-danger', 'weak'));
        element(by.model('fields.password')).clear();
        // Test regular password
        element(by.model('fields.password')).sendKeys(browser.params.login.pwregular);
        browser.findElement(by.cssContainingText('div.progress-bar.ng-binding.progress-bar-warning', 'regular'));
        element(by.model('fields.password')).clear();
        // Test normal password
        element(by.model('fields.password')).sendKeys(browser.params.login.pwnormal);
        browser.findElement(by.cssContainingText('div.progress-bar.ng-binding.progress-bar-info', 'normal'));
        element(by.model('fields.password')).clear();
        // Test strong password
        element(by.model('fields.password')).sendKeys(login.pw);
        browser.findElement(by.cssContainingText('div.progress-bar.ng-binding.progress-bar-success', 'strong'));
        element(by.model('fields.password')).clear();
    });

    it('should test password matching', function() {
        element(by.cssContainingText('a.ng-scope', 'Create wallet')).click();
        element(by.model('fields.email')).sendKeys(browser.params.login.email);
        element(by.model('fields.password')).sendKeys(login.pw);
        element(by.model('fields.confirmation')).sendKeys(browser.params.login.pwweak);
        //browser.element(by.buttonText('Continue')).click();
        element(by.model('fields.password')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', 'Does not match'));
        element(by.model('fields.password')).clear();
        element(by.model('fields.confirmation')).clear();
    });

    it('should test email address validation', function() {
        element(by.cssContainingText('a.ng-scope', 'Create wallet')).click();
        // Test email address with only letters
        element(by.model('fields.email')).sendKeys(browser.params.login.pwweak);
        element(by.model('fields.password')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', 'Invalid'));
        element(by.model('fields.email')).clear();
        // Test email address with only numbers
        element(by.model('fields.email')).sendKeys(browser.params.login.nums);
        element(by.model('fields.password')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', 'Invalid'));
        element(by.model('fields.email')).clear();
        // Test email address with only special characters
        element(by.model('fields.email')).sendKeys(browser.params.login.chars);
        element(by.model('fields.password')).click();
        browser.findElement(by.cssContainingText('p.ng-binding', 'Invalid'));
        element(by.model('fields.email')).clear();
    });

    it('should test unsuccessful login, invalid UID', function() {
        element(by.model('uid')).clear();
        element(by.model('password')).clear();
        element(by.model('uid')).sendKeys(browser.params.login.uidfake);
        element(by.model('password')).sendKeys(login.pw);
        element(by.buttonText('Login')).click();
        browser.sleep(500);
        browser.findElement(by.cssContainingText('span.ng-binding.ng-scope', 'Unknown Wallet Identifier. Please check you entered it correctly.'));
    });

    it('should test unsuccessful login, invalid password', function() {
        element(by.model('uid')).clear();
        element(by.model('password')).clear();
        element(by.model('uid')).sendKeys(login.uid);
        element(by.model('password')).sendKeys(browser.params.login.pwweak);
        element(by.buttonText('Login')).click();
        browser.sleep(500);
        browser.findElement(by.cssContainingText('span.ng-binding.ng-scope', 'Error Decrypting Wallet. Please check your password is correct.'));
    });

});