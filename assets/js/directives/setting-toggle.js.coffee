angular.module('walletApp').directive('settingToggle', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      value: '='
      toggle: '&'
      enableTitle: '@'
      disableTitle: '@'
    }
    templateUrl: 'templates/setting-toggle.jade'
    link: (scope, elem, attrs) ->
  }
)
