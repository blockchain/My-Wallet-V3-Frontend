angular.module('walletApp').directive('currencyPicker', ($translate, Wallet, currency) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      currency: '='
      displayCurrency: '='
    }
    templateUrl: 'templates/currency-picker.jade'
    link: (scope, elem, attrs) ->
      scope.currencies = currency.currencies

      scope.didSelect = (item, model) ->
        scope.currency = item
        Wallet.saveActivity(2)
        unless currency.isBitCurrency(scope.displayCurrency)
          scope.displayCurrency = item
  }
)
