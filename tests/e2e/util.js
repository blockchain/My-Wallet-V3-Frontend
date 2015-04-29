/**
 * Created by kandrew on 4/24/15.
 */

var login = require('./ignore.js');

module.exports = {

    shouldContainCSS: function(selector, text) {

        browser.findElement(by.cssContainingText(selector, text));

    },

    getURL: function() {

        // Visit URL and validate page title
        browser.driver.get('https://bcwallet:sgzGcOzZoRqQ0bHN@dev.blockchain.info');
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

    submitBetaKey: function () {

        // Enter beta key and click Create Wallet button
        element(by.css('[ng-model="key"]')).sendKeys(login.betaKey);
        browser.findElement(by.css('[ng-click="register()"]')).click();

    }

}
