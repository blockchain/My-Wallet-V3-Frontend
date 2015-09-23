angular.module('walletApp').directive('isValidAmount', (Wallet, Currency) ->
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
        amountCurrency = scope.$eval(attrs.currency)
        allowedDecimals = Currency.decimalPlacesForCurrency(amountCurrency)
        return false if decimalPlaces(viewValue) > allowedDecimals
        return true
  }
)
