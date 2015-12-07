angular.module('walletApp').directive('fiat', (Wallet, currency) ->
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
      scope.conversions = currency.conversions

      scope.$watchCollection "conversions", (newVal) ->
        scope.updateFiat()

      scope.$watch "settings.currency.code + btc + currency", () ->
        scope.updateFiat()

      scope.updateFiat = () ->
        scope.fiat = { currencySymbol: null, amount: null }

        curr = scope.currency || scope.settings.currency || null
        return unless curr && curr.code

        conversion = scope.conversions[curr.code] || null
        return unless conversion && conversion.conversion > 0

        btc = scope.btc
        return unless btc != null && !isNaN(scope.btc)

        btc *= -1 if attrs.abs? && btc < 0

        scope.fiat.currencySymbol = conversion.symbol

        if scope.date?
          currency.getFiatAtTime(scope.date, btc, curr.code).then (fiat) ->
            scope.fiat.amount = fiat
            scope.$root.$safeApply(scope)
        else
          fiat = currency.convertFromSatoshi(btc, curr)
          scope.fiat.amount = (Math.floor(fiat * 100) / 100).toFixed(2)

  }
)
