exports.config = {

    // The address of a running selenium server
    seleniumAddress: 'http://localhost:4444/wd/hub',

    // Spec patterns are relative to the location of this config
    specs: ['**/*_spec.js'],

    suites: {
        transactions: '**/transactions_spec.js',
        login: '**/login_spec.js'
    },

    params: {
        login: {
            uidfake:    'c5825g04-8ke3-25r1-p103-3g000wr4-123',
            pwweak:     'asdf',
            pwregular:  'asdf!@#$',
            pwnormal:   'asdf!@#$asdf',
            email:      'example@example.com',
            nums:       '1234567890',
            chars:      '$^*%(^*#$&@'
        }
    },

    jasmineNodeOpts: {
        showColors: true,
        isVerbose: true,
        includeStackTrace: true
    },

    onPrepare: function() {
        browser.driver.manage().window().setSize(1024, 768);
    },

    // Capabilities to be passed to the webdriver instance
    multiCapabilities: [
        {
        // Firefox is not working at the moment, add phantomjs in the future
        browserName: 'chrome'
        }
    ]

}