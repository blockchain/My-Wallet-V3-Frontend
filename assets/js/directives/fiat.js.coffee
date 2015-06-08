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
      scope.fiat = 
        currencySymbol: null
        amount: null
      
      scope.settings = Wallet.settings
      scope.conversions = Wallet.conversions
      scope.$watchCollection "conversions", (newVal) ->
        updateFiat()
      scope.$watch "settings.currency.code + btc + currency", () ->
        updateFiat()
        
      updateFiat = () ->
        scope.fiat.currencySymbol = null
        scope.fiat.amount = null
        
        return unless scope.btc?
        return if scope.btc == ""
        return if isNaN(scope.btc)
        currency = undefined
        if scope.currency?
          currency = scope.currency 
        else
          currency = scope.settings.currency
                  
        (scope.fiat.amount = numeral(scope.btc).divide(100000000).format("0.[0000]") + " BTC"; return) unless currency?
        
        conversion = scope.conversions[currency.code]
        return  unless conversion? && conversion.conversion > 0
    
        btc = scope.btc
        
        if attrs.abs && btc < 0
          btc = btc * -1
    
        amount = null
        if scope.date?
          Wallet.getFiatAtTime(btc, scope.date, currency.code).then (fiat) ->
            scope.fiat.amount = fiat
          
        else
          amount = numeral(btc).divide(conversion.conversion).clone()
          scope.fiat.amount = amount.format("0.00")        
        
        scope.fiat.currencySymbol = conversion.symbol
                        
  }
)