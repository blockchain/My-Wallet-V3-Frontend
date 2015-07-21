walletApp.directive('fiat', (Wallet , $compile) ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      btc: '=btc'
      date: '=date'
      currency: '=currency'
    }
    template: "<span>{{ fiat.currencySymbol }}{{ fiat.amount }}</span>"
    link: (scope, elem, attrs) ->
      scope.fiat = { currencySymbol: null, amount: null }

      scope.settings = Wallet.settings
      scope.conversions = Wallet.conversions

      scope.$watchCollection "conversions", (newVal) ->
        scope.updateFiat()

      scope.$watch "settings.currency.code + btc + currency", () ->
        scope.updateFiat()

      scope.updateFiat = () ->
        # Reset scope.fiat
        scope.fiat = { currencySymbol: null, amount: null }

        # Check that a btc (satoshi) amount and a currency are accessable
        btc = scope.btc || null
        currency = scope.currency || scope.settings.currency || null
        return unless currency && currency.code && btc

        # Check that there is a valid conversion
        conversion = scope.conversions[currency.code] || null
        return unless conversion && conversion.conversion > 0

        # Absolute value if needed
        btc *= -1 if attrs.abs? && btc < 0

        # Set the symbol
        scope.fiat.currencySymbol = conversion.symbol

        # Set the amount
        if scope.date?
          Wallet.getFiatAtTime(btc, scope.date, currency.code).then (fiat) ->
            amount = fiat
        else
          amount = Wallet.convertFromSatoshi(btc, currency)

        scope.fiat.amount = amount.toFixed(2)

  }
)
