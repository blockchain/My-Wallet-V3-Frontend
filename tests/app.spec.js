'use strict';

beforeEach(angular.mock.module('walletApp'));
beforeEach(angular.mock.module('walletFilters'));

beforeEach(module("templates/activity-feed.jade"))
beforeEach(module('templates/adverts.jade'))
beforeEach(module("templates/amount.jade"))
beforeEach(module('templates/bc-async-input.jade'))
beforeEach(module('templates/helper-button.jade'))
beforeEach(module('templates/tor.jade'))
beforeEach(module('walletApp'))
beforeEach(module('templates/bc-async-input.jade'))
beforeEach(module("templates/btc-picker.jade"))
beforeEach(module('templates/completed-level.jade'))
beforeEach(module("templates/configure-mobile-number.jade"))
beforeEach(module("templates/configure-second-password.jade"))
beforeEach(module("templates/confirm-recovery-phrase.jade"))
beforeEach(module("templates/contextual-message.jade"))
beforeEach(module("templates/currency-picker.jade"))
beforeEach(module("templates/did-you-know.jade"))
beforeEach(module("templates/amount.jade"))
beforeEach(module("templates/ip-whitelist-restrict.jade"))
beforeEach(module("templates/language-picker.jade"))
beforeEach(module("templates/resend-email-confirmation.jade"))
beforeEach(module('partials/common.jade'))
beforeEach(module("templates/setting-toggle.jade"))
beforeEach(module('templates/transaction-note.html'))
beforeEach(module('templates/transaction-status.html'))
beforeEach(module('templates/transaction-description.html'))
beforeEach(module("templates/verify-email.jade"))
beforeEach(module("templates/verify-mobile-number.jade"))

beforeEach(interceptFeatureFlagCall);

function interceptFeatureFlagCall() {
  angular.mock.inject(($injector) => {
    $injector.get('$httpBackend').expectGET('/features.json')
      .respond(`
        [
          {
            "key": "key",
            "active": true,
            "name": "name",
            "description": "description"
          }
        ]
      `);
  });
}
