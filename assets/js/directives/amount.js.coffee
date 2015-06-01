walletApp.directive('amount', (Wallet) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '=transaction'
    }
    templateUrl: 'templates/amount.jade'
    link: (scope, elem, attrs) ->
      scope.settings = Wallet.settings

      scope.shouldShowFiat = () ->
        if scope.settings.displayCurrency?
          for btcCur in ['BTC', 'mBTC', 'bits']
            return false if btcCur == scope.settings.displayCurrency.code
        return true

      scope.currencyCodeIs = (code) ->
        if scope.settings.displayCurrency?
          return code == scope.settings.displayCurrency.code
        return false
      
      scope.toggle = () ->
        if scope.settings.displayCurrency?
          if scope.settings.displayCurrency.code == scope.settings.currency.code
            scope.settings.displayCurrency = scope.settings.btcCurrency
          else
            scope.settings.displayCurrency = scope.settings.currency

      scope.$watch 'settings.btcCurrency', (newBtcCurrency) ->
        if not scope.shouldShowFiat()
          scope.settings.displayCurrency = newBtcCurrency

  }
)