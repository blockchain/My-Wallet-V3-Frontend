walletApp.directive('isValidAmount', (Wallet) ->
  {
    restrict: 'A'
    require: 'ngModel'
    link: (scope, elem, attrs, ctrl) ->

      decimalPlaces = (number) ->
        if number?
          return (number.toString().split('.')[1] || []).length

      allowedDecimalPlaces = (currency) ->
        if Wallet.isBitCurrency(currency)
          return 8 if currency.code == 'BTC'
          return 6 if currency.code == 'mBTC'
          return 4 if currency.code == 'bits'
        return 2

      ctrl.$validators.isValidAmount = (modelValue, viewValue) ->
        return false if isNaN(viewValue)
        return false if parseFloat(viewValue) < 0
        return false if decimalPlaces(viewValue) > allowedDecimalPlaces(attrs.currency)
        return true
  }
)
