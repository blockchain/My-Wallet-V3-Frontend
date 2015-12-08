angular.module('walletApp').directive('isValidAmount', (Wallet, currency) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->

      decimalPlaces = (number) ->
        if number?
          return (number.toString().split('.')[1] || []).length

      ctrl.$validators.isValidAmount = (modelValue, viewValue) ->
        return false if isNaN(viewValue)
        return false if parseFloat(viewValue) < 0
        return false if decimalPlaces(viewValue) > currency.decimalPlacesForCurrency(scope.$eval attrs.currency)
        return true
  }
)
