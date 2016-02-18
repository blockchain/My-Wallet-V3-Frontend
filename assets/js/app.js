'use strict';

const modules = [
  'walletApp.core',

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

  'ui.select',
  'ngAudio',
  'ngSanitize',
  'ja.qr',
  'pascalprecht.translate',
  'bcTranslateStaticFilesLoader',
  'angular-inview',
  'passwordEntropy',
  'webcam',
  'bcQrReader',

  'bcPhoneNumber',

  'templates-main'
];

angular.module('walletApp', modules)
.config(($uibModalProvider, uiSelectConfig) => {
  uiSelectConfig.theme = 'bootstrap';
})
.run(($rootScope, $uibModal, $state, MyWallet, $q, currency) => {

  $rootScope.$safeApply = (scope=$rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.refresh = () => {

    $rootScope.refreshing = true;
    let amt = MyWallet.wallet.txList.transactions().length;
    $q.all([MyWallet.wallet.getHistory(), currency.fetchExchangeRate(), MyWallet.wallet.txList.fetchTxs(amt, true)])
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $rootScope.$broadcast('refresh');
        $timeout(() => $rootScope.refreshing = false, 500);
      });
  }

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });

});
