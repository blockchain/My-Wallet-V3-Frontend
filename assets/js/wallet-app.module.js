let debugLog = [];
let log = console.log.bind(console);
console.log = (...args) => { debugLog.push(args); log(...args); };
console.replay = () => debugLog.forEach(l => log(...l));

/* eslint-disable angular/window-service */
if (browserDetection().browser === 'ie' && browserDetection().version < 11) {
  if (confirm("Your browser is out of date! It looks like you're using an old version of Internet Explorer. For the best Blockchain experience, please update your browser or hit cancel to return to our homepage.")) {
    window.location = 'http://browsehappy.com/';
  } else {
    window.location = 'https://blockchain.info/';
  }
}
/* eslint-enable angular/window-service */

const modules = [
  'ngAnimate',
  'ngSanitize',
  'pascalprecht.translate',
  'ui.bootstrap',
  'ui.router',
  'shared',
  'walletTranslations',
  'oc.lazyLoad',
  // Not needed for landing page, but loading it now for the config step below:
  'ui.select',
  // Not needed for landing page, TODO: lazy load
  'ngFileUpload'
];

angular.module('walletApp', modules)
.config(($compileProvider, uiSelectConfig, $ocLazyLoadProvider) => {
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|data):/);
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
  $compileProvider.debugInfoEnabled(false);
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
.run(($rootScope, $window, $uibModal, $state, $q, $timeout, $location, languages) => {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };

  $rootScope.safeWindowOpen = (url) => {
    let otherWindow = window.open(url, '_blank');
    otherWindow.opener = null;
  };

  $rootScope.browserCanExecCommand = (
    (browserDetection().browser === 'chrome' && browserDetection().version > 42) ||
    (browserDetection().browser === 'firefox' && browserDetection().version > 40) ||
    (browserDetection().browser === 'ie' && browserDetection().version > 10)
  );

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.pug',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });

  $rootScope.$watch('rootURL', () => {
    // If a custom rootURL is set by index.pug:
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

    // Not set by grunt dist:
    $rootScope.isProduction = $rootScope.rootURL === 'https://blockchain.info/' || $rootScope.rootURL === '/';
    $rootScope.buySellDebug = false;

    console.info(
      'Using My-Wallet-V3 Frontend %s and My-Wallet-V3 v%s, connecting to %s',
      $rootScope.versionFrontend, $rootScope.versionMyWallet, $rootScope.rootURL
    );

    if ($rootScope.sfoxUseStaging === undefined) {
      $rootScope.sfoxUseStaging = null;
    }

    if ($rootScope.sfoxUseStaging) {
      console.info(
        'Using SFOX staging environment with API key %s, Plaid environment %s and Sift Science key %s.',
        $rootScope.sfoxApiKey,
        $rootScope.sfoxPlaidEnv,
        $rootScope.sfoxSiftScienceKey
      );
    }
  });

  let code = languages.parseFromUrl($location.absUrl());
  if (code) languages.set(code);

  $rootScope.installLock = function () {
    this.locked = false;
    this.lock = () => { this.locked = true; };
    this.free = () => { this.locked = false; };
  };

  let setSizes = (width) => {
    let size = $rootScope.size = {};
    size.xs = width < 768;
    size.sm = width >= 768 && width < 992;
    size.md = width >= 992 && width < 1200;
    size.lg = width >= 1200;
    $rootScope.$safeApply();
  };

  setSizes($window.innerWidth);
  angular.element($window).bind('resize', () => setSizes($window.innerWidth));
});
