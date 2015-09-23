angular.module('walletApp').directive('currencyPicker', ($translate, Wallet, Currency) ->
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
        Wallet.saveActivity(2)
        unless Currency.isBitCurrency(scope.displayCurrency)
          scope.displayCurrency = item
  }
)
