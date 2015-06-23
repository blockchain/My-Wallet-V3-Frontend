walletApp.directive('isNotNull', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->

      ctrl.$validators.isNull = (modelValue, viewValue) ->
        return false if viewValue == null
        return false if viewValue == undefined
        return false if viewValue == ''
        return true
  }
)