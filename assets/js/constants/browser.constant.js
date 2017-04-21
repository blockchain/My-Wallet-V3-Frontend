angular.module('walletApp')
.constant('browser', {
  canExecCommand: (
    (browserDetection().browser === 'chrome' && browserDetection().version > 42) ||
    (browserDetection().browser === 'firefox' && browserDetection().version > 40) ||
    (browserDetection().browser === 'ie' && browserDetection().version > 10)
  )
});
