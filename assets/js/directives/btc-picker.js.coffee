angular.module('walletApp').directive('btcPicker', ($translate, Wallet, Currency) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      currency: '='
      displayCurrency: '='
    }
    templateUrl: 'templates/btc-picker.jade'
    link: (scope, elem, attrs) ->
      scope.currencies = Wallet.btcCurrencies

      scope.didSelect = (item, model) ->
        scope.currency = item
        Wallet.saveActivity(2)
        if Currency.isBitCurrency(scope.displayCurrency)
          scope.displayCurrency = item
  }
)
