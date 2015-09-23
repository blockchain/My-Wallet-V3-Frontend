angular.module('walletApp').directive('fiatOrBtc', (Wallet, Currency) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      btc: '=btc'
    }
    templateUrl: 'templates/fiat-or-btc.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings
      scope.currency = scope.settings.displayCurrency
      scope.isBitCurrency = Currency.isBitCurrency

      scope.updateDisplay = () ->
        scope.currency = Wallet.settings.displayCurrency

      scope.$watch 'settings.displayCurrency', () ->
        scope.updateDisplay()
  }
)
