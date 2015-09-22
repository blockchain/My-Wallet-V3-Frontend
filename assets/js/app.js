'use strict';

window.theFormatter = (val) => {
  return 'Nonsense';
};

const modules = [
  'walletFilters',
  'walletServices',
  'securityCenter',
  'didYouKnow',
  'activity',
  'adverts',
  'ui.router',
  'ui.bootstrap',
  'ngCookies',
  'ngAnimate',

  // TODO get rid of these wrappers and modify the original files to work with injection?
  'myWalletServices',
  'myWalletStoreServices',
  'myWalletSpenderServices',
  'myBlockchainApiServices',
  'myBlockchainSettingsServices',

  'ui.select',
  'ngAudio',
  'ngSanitize',
  'ja.qr',
  'LocalStorageModule',
  'ngNumeraljs',
  'pascalprecht.translate',
  'bcTranslateStaticFilesLoader',
  'angular-inview',
  'passwordEntropy',
  'internationalPhoneNumber',
  'webcam',
  // TODO: have grunt generate the list of partials and templates
  'partials/account-form.jade',
  'partials/reveal-xpub.jade',
  'partials/alerts.jade',
  'partials/alpha-agreement.jade',
  'partials/claim.jade',
  'partials/home.jade',
  'partials/support.jade',
  'partials/feedback.jade',
  'partials/first-login-modal.jade',
  'partials/login.jade',
  'partials/navigation.jade',
  'partials/open-link.jade',
  'partials/request.jade',
  'partials/second-password.jade',
  'partials/send.jade',
  'partials/signup.jade',
  'partials/top.jade',
  'partials/transaction.jade',
  'partials/transactions.jade',
  'partials/upgrade.jade',
  'partials/wallet-navigation.jade',
  'partials/common.jade',
  'partials/modal-notification.jade',
  'partials/recover-funds.jade',
  'partials/privacy-policy.jade',
  'partials/terms-of-service.jade',
  'partials/security-center.jade',
  'partials/settings/accounts.jade',
  'partials/settings/addresses.jade',
  'partials/settings/address.jade',
  'partials/settings/hd_address.jade',
  'partials/settings/advanced.jade',
  'partials/settings/change-password.jade',
  'partials/settings/import-address.jade',
  'partials/settings/mobile.jade',
  'partials/settings/my-details.jade',
  'partials/settings/set-second-password.jade',
  'partials/settings/settings.jade',
  'partials/settings/show-private-key.jade',
  'partials/settings/wallet-recovery.jade',
  'partials/settings/wallet.jade',
  'partials/settings/two-factor.jade',
  'partials/confirm-recovery-phrase-modal.jade',
  'partials/wallet.jade',
  'templates/activity-feed.jade',
  'templates/amount.jade',
  'templates/fiat-or-btc.jade',
  'templates/virtual-keyboard.jade',
  'templates/currency-picker.jade',
  'templates/language-picker.jade',
  'templates/helper-button.jade',
  'templates/helper-popover.jade',
  'templates/did-you-know.jade',
  'templates/contextual-message.jade',
  'templates/completed-level.jade',
  'templates/completed-level-tooltip.jade',
  'templates/transaction-description.jade',
  'templates/transaction-note.jade',
  'templates/transaction-status.jade',
  'templates/confirm-recovery-phrase.jade',
  'templates/configure-second-password.jade',
  'templates/tor.jade',
  'templates/setting-toggle.jade',
  'templates/ip-whitelist-restrict.jade',
  'templates/bc-async-input.jade',
  'templates/verify-email.jade',
  'templates/resend-email-confirmation.jade',
  'templates/adverts.jade',
  'templates/btc-picker.jade',
  'templates/configure-mobile-number.jade',
  'templates/verify-mobile-number.jade',
  'templates/transclude.jade',
  'templates/label-origin.jade'
];

angular.module('walletApp', modules)
.config(($numeraljsConfigProvider, $modalProvider, uiSelectConfig) => {
  $numeraljsConfigProvider.setFormat('btc', '0,0.00 BTC');
  uiSelectConfig.theme = 'bootstrap';
})
.run(($rootScope, $modal) => {

  $rootScope.$safeApply = (scope=$rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.$on('showNotification', (_, notification) => {
    $modal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });

});
