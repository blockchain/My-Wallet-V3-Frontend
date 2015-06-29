walletApp.directive('isValid', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isNotValid = (modelValue, viewValue) ->
        return typeof attrs.isValid == 'function' && attrs.isValid(viewValue)
  }
)
