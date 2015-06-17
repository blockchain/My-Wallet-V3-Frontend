walletApp.directive('isEqual', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    scope: {
      isEqual: '='
    }
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.equalityError = (modelValue, viewValue) ->
        if scope.isEqual == viewValue
          return true
        return false
  }
)