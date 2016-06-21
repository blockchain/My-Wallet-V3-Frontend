'use strict';

if (browserDetection().browser === 'ie' && browserDetection().version < 11) {
  if (confirm("Your browser is out of date! It looks like you're using an old version of Internet Explorer. For the best Blockchain experience, please update your browser or hit cancel to return to our homepage.")) {
    window.location = 'http://browsehappy.com/';
  } else {
    window.location = 'https://blockchain.info/';
  }
}

const modules = [
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

  $ocLazyLoadProvider.config({
    debug: true,
    events: true,
    modules: [{
      name: 'walletLazyLoad',
      files: [
        'bower_components/blockchain-wallet/dist/my-wallet.min.js',
        'build/js/wallet.js',
        'build/css/wallet.css'
      ]
    }]
  });
})
.constant('whatsNew', [
  { title: 'WHATS_NEW', desc: 'WHATS_NEW_EXPLAIN', date: 1463716800000 },
  { title: 'SIGN_VERIFY', desc: 'SIGN_VERIFY_EXPLAIN', date: 1462161600000 },
  { title: 'TRANSFER_ALL', desc: 'TRANSFER_ALL_EXPLAIN', date: 1461556800000 }
])
// .run(($rootScope, $uibModal, $state, MyWallet, $q, currency, $timeout) => {
.run(($rootScope, $uibModal, $state, $q, $timeout) => {
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
    // $q.all([ MyWallet.wallet.getHistory(), currency.fetchExchangeRate() ])
    //   .catch(() => console.log('error refreshing'))
    //   .finally(() => {
    //     $rootScope.$broadcast('refresh');
    //     $timeout(() => $rootScope.refreshing = false, 500);
    //   });
  };

  $rootScope.$on('showNotification', (_, notification) => {
    $uibModal.open({
      templateUrl: 'partials/modal-notification.jade',
      controller: 'ModalNotificationCtrl',
      windowClass: 'notification-modal',
      resolve: { notification: () => notification }
    });
  });
})

.controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $timeout, $window) {
  $scope.scrollTo = (element, to, duration) => {
    let start = element.scrollTop;
    let change = to - start;
    let increment = 20;

    let animateScroll = (elapsedTime) => {
      elapsedTime += increment;
      let position = $scope.easeInOut(elapsedTime, start, change, duration);
      element.scrollTop = position;
      if (elapsedTime < duration) {
        $timeout(() => {
          animateScroll(elapsedTime);
        }, increment);
      }
    };

    animateScroll(0);
  };

  $scope.easeInOut = (currentTime, start, change, duration) => {
    currentTime /= duration / 2;
    if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
    }
    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
  };

  $scope.scroll = (id) => {
    let top = document.getElementById(id).offsetTop;
    $scope.scrollTo(document.body, top, 500);
  };

  $scope.signup = () => {
    // $state.go('public.signup', { email: $scope.fields.email });
  };
}
