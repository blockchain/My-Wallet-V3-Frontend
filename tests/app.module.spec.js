const modules = [
  'walletApp.core',

  'walletFilters',
  'walletServices',
  'securityCenter',
  'didYouKnow',
  'activity',
  'adverts',
  'options',
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

  'templates-main',
  'oc.lazyLoad'
];

angular.module('walletApp', modules).run(($rootScope) => {
  $rootScope.$safeApply = (scope = $rootScope, before) => {
    before = before;
    if (!scope.$$phase && !$rootScope.$$phase) scope.$apply(before);
  };
  $rootScope.scheduleRefresh = () => {};
  $rootScope.cancelRefresh = () => {};
});

beforeEach(module('templates-main'));
