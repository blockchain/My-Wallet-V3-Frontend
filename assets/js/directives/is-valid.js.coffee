angular.module('walletApp').directive('isValid', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$viewChangeListeners.push () ->
        ctrl.$setValidity('isValid', scope.$eval(attrs.isValid))
  }
)
