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
  'walletFilters',
  'oc.lazyLoad',
  'LocalStorageModule',
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
.run(() => {
});
