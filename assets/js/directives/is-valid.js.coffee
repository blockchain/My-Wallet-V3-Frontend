walletApp.directive('isValid', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      isValid: '='
    }
    link: (scope, elem, attrs, ctrl) ->

      ctrl.$validators.isNotValid = (modelValue, viewValue) ->
        if scope.isValid(viewValue)
          return true
        return false
  }
)