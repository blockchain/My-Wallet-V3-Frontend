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
  'translations',
  'sharedDirectives'
];

angular.module('landingApp', modules)
.config(() => {
})
.run(($rootScope, $window) => {
  $rootScope.i18nLoaded = false;

  var e = document.getElementById('wallet-app');
  angular.element(e).ready(function () {
    const loadWallet = function () {
      // Add script and CSS tags to load main wallet app:
      const loadScript = (path) => {
        let tag = angular.element(document.createElement('script'));
        tag.attr('src', path);
        tag.attr('type', 'text/javascript');
        tag[0].async = false; // Ensure correct execution order
        angular.element(document.body).append(tag);
        return tag;
      };
      const loadCSS = (path) => {
        let tag = angular.element(document.createElement('link'));
        tag.attr('rel', 'stylesheet');
        tag.attr('type', 'text/css');
        tag.attr('href', path);
        angular.element(document.head).append(tag);
        return tag;
      };
      // @ifndef PRODUCTION
      loadScript('bower_components/blockchain-wallet/dist/my-wallet.min.js');
      loadScript('build/js/wallet.js');
      loadCSS('build/css/wallet.css');
      // @endif
      /* @ifdef PRODUCTION **
      loadScript('js/my-wallet.min.js')
      loadScript('js/wallet.min.js')
      loadCSS('css/wallet.css');
      /* @endif */

      $rootScope.$digest();
    };

    if ($window.location.hash === '' || $window.location.hash === '#/') {
      // Delay wallet JS / CSS download until user navigates to login / signup
      angular.element(window).on('hashchange', function () {
        if ($window.location.hash === '#/login' || $window.location.hash === '#/signup') {
          loadWallet();
        }
      });
    } else {
      loadWallet();
    }
  });
});

angular
  .module('landingApp')
  .controller('LandingCtrl', LandingCtrl);

function LandingCtrl ($scope, $timeout, $window) {
  $scope.fields = { email: '' };

  $scope.shouldHide = () => {
    let shouldHide = !($window.location.hash === '' || $window.location.hash === '#/');
    return shouldHide;
  };

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
