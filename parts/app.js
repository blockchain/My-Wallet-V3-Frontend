'use strict';

const modules = [
  'ngAnimate',
  'ngSanitize',
  // 'pascalprecht.translate',
  // 'bcTranslateStaticFilesLoader',
  'ui.bootstrap',
  // 'translations',
  'ui.select',
  'walletDirectives',
  'templates-main'
];

angular.module('partsApp', modules)
.config(($compileProvider, uiSelectConfig) => {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
  uiSelectConfig.theme = 'bootstrap';
})
.run(($rootScope, $uibModal, $q, $timeout, $location) => {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.browserCanExecCommand = (
    (browserDetection().browser === 'chrome' && browserDetection().version > 42) ||
    (browserDetection().browser === 'firefox' && browserDetection().version > 40) ||
    (browserDetection().browser === 'ie' && browserDetection().version > 10)
  );

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });

  $rootScope.$watch('rootURL', () => {
    // If a custom rootURL is set by index.jade:
    //                    Grunt can replace this:
    const customRootURL = $rootScope.rootURL;
    // If customRootURL is set by Grunt:
    $rootScope.rootURL = customRootURL;

    const absUrl = $location.absUrl();
    const path = $location.path();
    if (absUrl && path && path.length) {
      // e.g. https://blockchain.info/wallet/#
      $rootScope.rootPath = $location.absUrl().slice(0, -$location.path().length);
    }

    // These are set by grunt dist:
    $rootScope.versionFrontend = null;
    $rootScope.versionMyWallet = null;
    $rootScope.buySellDebug = true;
  });
});
