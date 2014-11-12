walletApp.directive('transactionDescription', ($translate, $rootScope, Wallet) ->
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
      
      from_address = scope.transaction.from_addresses[0]
      to_address   = scope.transaction.to_addresses[0]
            
      if scope.transaction.intraWallet
        phrase = "MOVED_BITCOIN_WITHIN_WALLET"
        to = Wallet.accounts[scope.transaction.to_account].label
      else
        if scope.transaction.from_account?
          phrase = "SPENT_BITCOIN"
          if to_name = Wallet.addressBook[to_address]
            to = to_name
          else
            to = to_address
        else 
          phrase = "RECEIVED_BITCOIN"
          from = scope.transaction.to_account
          if from_name = Wallet.addressBook[from_address]
            from = from_name
          else
            from = from_address
          
      $translate(phrase, {from: from, to: to}).then (translation) ->
        scope.description = translation
      
  }
)