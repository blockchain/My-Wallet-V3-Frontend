angular.module('walletApp').directive('isNotEqual', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isNotEqual = (modelValue, viewValue) ->
        if attrs.property? && attrs.property != '' && viewValue?
          viewValue = viewValue[attrs.property]
        return attrs.isNotEqual != viewValue
  }
)
