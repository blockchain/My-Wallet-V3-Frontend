'use strict';

if (browserDetection().browser === 'ie' && browserDetection().version < 11) {
  if (confirm("Your browser is out of date! It looks like you're using an old version of Internet Explorer. For the best Blockchain experience, please update your browser or hit cancel to return to our homepage.")) {
    window.location = 'http://browsehappy.com/';
  } else {
    window.location = 'https://blockchain.info/';
  }
}

const modules = [
  'ngAnimate',
  'ngSanitize',
  'pascalprecht.translate',
  'bcTranslateStaticFilesLoader',
  'ui.bootstrap',
  'ui.router',
  'translations',
  'sharedDirectives',
  'oc.lazyLoad',
  // Not needed for landing page, but loading it now for the config step below:
  'ui.select'
];

angular.module('walletApp', modules)
.config(($compileProvider, uiSelectConfig, $ocLazyLoadProvider) => {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|blob):/);
  uiSelectConfig.theme = 'bootstrap';

  // @if !PRODUCTION
  const walletLazyLoadFiles = [
    'bower_components/blockchain-wallet/dist/my-wallet.js',
    'build/js/wallet.js'
  ];
  const bcQrReaderLazyLoadFiles = [
    'bower_components/bc-qr-reader/dist/bc-qr-reader.js'
  ];
  const bcPhoneNumberLazyLoadFiles = [
    'build/js/bc-phone-number.js'
  ];
  // @endif

  /* @if PRODUCTION **
  var walletLazyLoadFiles = [
    'js/my-wallet.min.js',
    'js/wallet.min.js'
  ];
  var bcQrReaderLazyLoadFiles = [
    'js/bc-qr-reader.min.js'
  ];
  var bcPhoneNumberLazyLoadFiles = [
    'js/bc-phone-number.min.js'
  ];
  /* @endif */

  $ocLazyLoadProvider.config({
    debug: false,
    events: false,
    modules: [{
      name: 'walletLazyLoad',
      files: walletLazyLoadFiles
    }, {
      name: 'bcQrReader',
      files: bcQrReaderLazyLoadFiles
    }, {
      name: 'bcPhoneNumber',
      files: bcPhoneNumberLazyLoadFiles
    }]
  });
})
.constant('whatsNew', [
  { title: 'EXPORT_HISTORY', desc: 'EXPORT_HISTORY_EXPLAIN', date: 1466521300000 },
  { title: 'WHATS_NEW', desc: 'WHATS_NEW_EXPLAIN', date: 1463716800000 },
  { title: 'SIGN_VERIFY', desc: 'SIGN_VERIFY_EXPLAIN', date: 1462161600000 },
  { title: 'TRANSFER_ALL', desc: 'TRANSFER_ALL_EXPLAIN', date: 1461556800000 },
  { title: 'DEV_THEMES', desc: 'DEV_THEMES_EXPLAIN', date: 1474862400000 }
])
// .run(($rootScope, $uibModal, $state, MyWallet, $q, currency, $timeout) => {
.run(($rootScope, $uibModal, $state, $q, $timeout, $location) => {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

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

    console.info(
      'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
      $rootScope.versionFrontend, $rootScope.versionMyWallet, $rootScope.rootURL
    );
  });
});
