walletApp.directive('fiat', (Wallet , $compile) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      btc: '=btc'
      date: '=date'
    }
    template: "<span>{{ currencySymbol }}{{ fiat }}</span>"
    link: (scope, elem, attrs) ->      
      scope.settings = Wallet.settings
      scope.conversions = Wallet.conversions
      scope.$watchCollection "conversions", (newVal) ->
        updateFiat()
      scope.$watch "settings.currency", (newVal) ->
        updateFiat()
      scope.$watch "btc", (newVal) ->
        updateFiat()
        
      updateFiat = () ->
        (scope.fiat = ""; return) unless scope.btc?
        (scope.fiat = ""; return) if scope.btc == ""
        (scope.fiat = ""; return) if isNaN(scope.btc)
        (scope.fiat = numeral(scope.btc).divide(100000000).format("0.[0000]") + " BTC"; return) unless scope.settings.currency?
        conversion = scope.conversions[scope.settings.currency.code]
        (scope.fiat = ""; return)  unless conversion? && conversion.conversion > 0
    
        btc = scope.btc
        
        if attrs.abs && btc < 0
          btc = btc * -1
    
        amount = null
        if scope.date?
          scope.fiat = null
          Wallet.getFiatAtTime(btc, scope.date, scope.settings.currency.code).then (fiat) ->
            scope.fiat = fiat
          
        else
          amount = numeral(btc).divide(conversion.conversion).clone()
          scope.fiat = amount.format("0.00")                
        
        scope.currencySymbol = conversion.symbol
        
  }
)