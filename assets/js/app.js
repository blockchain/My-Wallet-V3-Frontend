'use strict';

window.theFormatter = (val) => {
  return 'Nonsense';
};

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
  'LocalStorageModule',
  'ngNumeraljs',
  'pascalprecht.translate',
  'bcTranslateStaticFilesLoader',
  'angular-inview',
  'passwordEntropy',
  'internationalPhoneNumber',
  'webcam',

  'templates-main'
];

var walletApp = angular.module('walletApp', modules)
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
