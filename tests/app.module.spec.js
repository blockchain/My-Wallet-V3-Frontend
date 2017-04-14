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
  'ngFileUpload',

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

  $rootScope.safeWindowOpen = () => {};

  $rootScope.scheduleRefresh = () => {};
  $rootScope.cancelRefresh = () => {};

  $rootScope.installLock = function () {
    this.locked = false;
    this.lock = () => { this.locked = true; };
    this.free = () => { this.locked = false; };
  };

  $rootScope.isProduction = true;
  $rootScope.size = { xs: false, sm: false, md: false, lg: true };
});

beforeEach(module('templates-main'));
