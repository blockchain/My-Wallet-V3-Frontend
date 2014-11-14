walletApp.directive('transactionDescription', ($translate, $rootScope, Wallet, $compile, $sce) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '='
    }
    templateUrl: 'templates/transaction-description.html'
    link: (scope, elem, attrs) ->
      phrase = undefined
      from = undefined
      to = undefined
      
      scope.tooltip = null
      
      from_address = scope.transaction.from_addresses[0]
      to_address   = scope.transaction.to_addresses[0]
      address = null
                      
      if scope.transaction.intraWallet
        scope.action = "MOVED_BITCOIN_TO"
        scope.subject = Wallet.accounts[scope.transaction.to_account].label
      else
        if scope.transaction.from_account?
          address = to_address
          scope.action = "SENT_BITCOIN_TO"
          if to_name = Wallet.addressBook[to_address]
            scope.subject = to_name
          else 
            scope.subject = "A_BITCOIN_ADDRESS"
            scope.address = to_address
        else
          address = from_address
          scope.action = "RECEIVED_BITCOIN_FROM"
          if from_name = Wallet.addressBook[to_address]
            scope.subject = from_name
          else 
            scope.subject = "A_BITCOIN_ADDRESS"
            scope.address = from_address

        $translate(phrase, {from: from, to: to, address: address}).then (translation) ->
          scope.description = translation
          
          $sce.trustAsHtml(scope.description)
  
          $compile(elem)(scope)
  }
)