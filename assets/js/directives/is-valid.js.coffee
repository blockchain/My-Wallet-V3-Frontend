walletApp.directive('isValid', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      isValid: '='
    }
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isValid = (modelValue, viewValue) ->
        return typeof scope.isValid == 'function' && scope.isValid(viewValue)
  }
)
