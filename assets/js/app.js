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
  'webcam',
  'bcQrReader',

  'bcPhoneNumber',

  'templates-main'
];

angular.module('walletApp', modules)
.config(($uibModalProvider, uiSelectConfig) => {
  uiSelectConfig.theme = 'bootstrap';
})
.constant('whatsNew', [
  { title: 'WHATS_NEW',
    desc: 'WHATS_NEW_DESCRIPTION',
    date: 1459697821925 },
  { title: 'DYNAMIC_FEE',
    desc: 'DYNAMIC_FEE_DESCRIPTION',
    date: 1458920233357 }
])
.run(($rootScope, $uibModal, $state, MyWallet, $q, currency, $timeout) => {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.scheduleRefresh = () => {
    $rootScope.cancelRefresh();
    $rootScope.refreshTimeout = $timeout($rootScope.refresh, 3000);
  };

  $rootScope.cancelRefresh = () => {
    $timeout.cancel($rootScope.refreshTimeout);
  };

  $rootScope.refresh = () => {
    $rootScope.refreshing = true;
    $q.all([ MyWallet.wallet.getHistory(), currency.fetchExchangeRate() ])
      .catch(() => console.log('error refreshing'))
      .finally(() => {
        $rootScope.$broadcast('refresh');
        $timeout(() => $rootScope.refreshing = false, 500);
      });
  };

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });
});
