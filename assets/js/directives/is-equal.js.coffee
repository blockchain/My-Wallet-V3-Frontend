walletApp.directive('isEqual', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isEqual = (modelValue, viewValue) ->
        if attrs.property? && attrs.property != '' && viewValue?
          viewValue = viewValue[attrs.property]
        return attrs.isEqual == viewValue
  }
)
