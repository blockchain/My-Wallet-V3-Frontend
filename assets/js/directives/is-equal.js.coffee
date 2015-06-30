walletApp.directive('isEqual', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isEqual = (modelValue, viewValue) ->
        return attrs.isEqual == viewValue unless attrs.not?
        return attrs.isEqual != viewValue
  }
)
