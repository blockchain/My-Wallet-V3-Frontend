
angular
  .module('walletDirectives')
  .directive('settingToggle', settingToggle);

function settingToggle ($translate, Wallet) {
  const directive = {
    restrict: 'E',
    replace: true,
    scope: {
      value: '=',
      toggle: '&',
      enableTitle: '@',
      disableTitle: '@'
    },
    templateUrl: 'templates/setting-toggle.jade',
    link: () => {}
  };
  return directive;
}
