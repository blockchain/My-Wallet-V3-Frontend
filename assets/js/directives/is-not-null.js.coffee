angular.module('walletApp').directive('isNotNull', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->
      ctrl.$validators.isNotNull = (modelValue, viewValue) ->
        if attrs.isNotNull != ''
          modelValue = modelValue[attrs.isNotNull]
        return false if modelValue == null
        return false if modelValue == undefined
        return false if modelValue == ''
        return true
  }
)
