var login = require('./ignore.js');

module.exports = {

    shouldContainCSS: function(selector, text) {

        browser.findElement(by.cssContainingText(selector, text));

    },

    getURL: function() {

        // Visit URL and validate page title
        // Use ONE of the following two lines to enable tests on staging versus localhost.
        browser.driver.get('https://dev.blockchain.info/#/login'); // Staging server
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
        element(by.css('a.dropdown-toggle.profile.ng-scope')).click();
        element.all(by.css('[ng-click="logout()"]')).first().click();
        browser.switchTo().alert().accept();

    },

    submitBetaKey: function () {

        var promise = browser.getCurrentUrl();
        promise.then(function(currentURL) {
            // console.log("URL is: " + currentURL);

            if (currentURL == 'http://local.blockchain.com:8080/#/login') {
                console.log('URL is local.blockchain.com:8080');

                // Click Create Wallet button
                browser.findElement(by.css('[translate="CREATE_WALLET"]')).click();

            }

            else if (currentURL == 'https://dev.blockchain.info/#/login') {
                console.log('URL is dev.blockchain.info');

                // Enter beta key and click Create Wallet button
                element(by.css('[ng-model="key"]')).sendKeys(login.betaKey);
                browser.findElement(by.css('[ng-click="register()"]')).click();

            }

            else {
                console.log('Unable to determine server instance')

            }
        })

    }

}
