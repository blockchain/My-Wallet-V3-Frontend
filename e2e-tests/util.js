var login = require('./ignore.js');

module.exports = {

    getURL: function() {

        // Visit URL and validate page title
        // Use ONE of the following two lines to enable tests on staging versus localhost.
        browser.driver.get('https://dev.blockchain.info/#/login'); // Dev server
        //browser.driver.get('https://staging.blockchain.info/#/login'); // Staging server
        //browser.driver.get('https://alpha.blockchain.info/#/login'); // Alpha server
        //browser.driver.get('http://local.blockchain.com:8080/#/login'); // Localhost

        expect(browser.getTitle()).toEqual('Blockchain Wallet HD');

    },

    logIn: function() {

        // Clear login text fields
        element(by.model('uid')).clear();
        element(by.model('password')).clear();

        // Fill text fields with login credentials, submit
        element(by.model('uid')).sendKeys(login.uid);
        element(by.model('password')).sendKeys(login.pw);
        element(by.id('login')).click();

    },

    logOut: function () {

        // Open Profile drop down menu, click Logout, and dismiss alert
        element.all(by.css('[ng-click="logout()"]')).first().click();
        browser.sleep(200);
        browser.switchTo().alert().accept();

    },

    validateHome: function () {

        // Validate account homepage details
        browser.sleep(3000); // Required wait for Request and Send button validation
        browser.findElement(by.css('[translate="REQUEST"]'));
        browser.findElement(by.css('[translate="SEND"]'));
        browser.findElement(by.css('.bc-well'));

    },

    navigateTo: function(section) {
      browser.sleep(2000);
      browser.findElement(by.css('[translate="' + section + '"]')).click();
    },

    submitBetaKey: function () {

        var promise = browser.getCurrentUrl();
        promise.then(function(currentURL) {

            // Is this still valid for localhost?
            if (currentURL == 'http://local.blockchain.com:8080/#/login') {
                console.log('URL is local.blockchain.com:8080');

                // Click Create Wallet button
                browser.findElement(by.css('[translate="CREATE_WALLET"]')).click();

            }

            else if (currentURL == 'https://dev.blockchain.info/#/login') {
                console.log('URL is dev.blockchain.info');

                // Click invite key link
                browser.findElement(by.css('[ng-click="prepareRegister()"]')).click();

                // Enter beta key and click Create Wallet button
                element(by.css('[ng-model="key"]')).sendKeys(login.betaKey);
                browser.findElement(by.css('[ng-click="register()"]')).click();

            }

            else if (currentURL == 'https://alpha.blockchain.info/#/login') {
                console.log('URL is dev.blockchain.info');

                // Click invite key link
                browser.findElement(by.css('[ng-click="status.enterkey = !status.enterkey"]')).click();

                // Enter beta key and click Create Wallet button
                element(by.css('[ng-model="key"]')).sendKeys(login.betaKey);
                browser.findElement(by.css('[ng-click="register()"]')).click();

            }

            else {
                console.log('Unable to determine server instance')

            }
        })

    },

    shouldContainCSS: function (selector, text) {

        browser.findElement(by.cssContainingText(selector, text));

    },

    scrollTo: function (selector) {
        var filter = browser.findElement(by.css(selector));
        var scrollIntoView = function () {
            arguments[0].scrollIntoView();
        };
        browser.executeScript(scrollIntoView, filter);
    }

}
