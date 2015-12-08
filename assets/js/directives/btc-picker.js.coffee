angular.module('walletApp').directive('btcPicker', ($translate, Wallet, currency) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      currency: '='
      displayCurrency: '='
    }
    templateUrl: 'templates/btc-picker.jade'
    link: (scope, elem, attrs) ->
      scope.currencies = currency.bitCurrencies

      scope.didSelect = (item, model) ->
        scope.currency = item
        Wallet.saveActivity(2)
        if currency.isBitCurrency(scope.displayCurrency)
          scope.displayCurrency = item
  }
)
