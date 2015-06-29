walletApp.directive('isEqual', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      isEqual: '='
    }
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isEqual = (modelValue, viewValue) ->
        return scope.isEqual == viewValue
  }
)
