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

      to_address = null
      from_address = null
      
      scope.tooltip = null
      
      if scope.transaction.from.legacyAddresses?
        from_address = scope.transaction.from.legacyAddresses.addressWithLargestOutput
      
      if scope.transaction.from.externalAddresses?
        from_address = scope.transaction.from.externalAddresses.addressWithLargestOutput

      if scope.transaction.to.legacyAddresses?
        to_address = scope.transaction.to.legacyAddresses.addressWithLargestOutput
        
      if scope.transaction.to.externalAddresses?
        to_address = scope.transaction.to.externalAddresses.addressWithLargestOutput
              
      address = null
                      
      if scope.transaction.intraWallet
        scope.action = "MOVED_BITCOIN_TO"
        if scope.transaction.to.account?
          scope.subject = Wallet.accounts[parseInt(scope.transaction.to.account.index)].label
        else
          if to_name = Wallet.addressBook[to_address]
            scope.subject = to_name 
          else
            scope.subject = "A_BITCOIN_ADDRESS"
      else
        if scope.transaction.from.account?
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
  }
)