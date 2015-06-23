walletApp.directive('currencyPicker', ($translate, Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      currency: '='
      displayCurrency: '='
    }
    templateUrl: 'templates/currency-picker.jade'
    link: (scope, elem, attrs) ->
      scope.currencies = Wallet.currencies
            
      scope.didSelect = (item, model) ->
        scope.currency = item
        unless Wallet.isBitCurrency(scope.displayCurrency)
          scope.displayCurrency = item
  }
)