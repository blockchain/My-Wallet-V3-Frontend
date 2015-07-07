walletApp.directive('transactionDescription', ($translate, $rootScope, Wallet, $compile, $sce) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      transaction: '='
    }
    templateUrl: 'templates/transaction-description.jade'
    link: (scope, elem, attrs) ->
      phrase = undefined
      from = undefined
      to = undefined

      to_address = null
      from_address = null

      scope.tooltip = null

      if scope.transaction.from.legacyAddresses? && scope.transaction.from.legacyAddresses.length
        from_address = scope.transaction.from.legacyAddresses[0].address

      if scope.transaction.from.externalAddresses?
        from_address = scope.transaction.from.externalAddresses.addressWithLargestOutput

      if scope.transaction.to.legacyAddresses? && scope.transaction.to.legacyAddresses.length
        to_address = scope.transaction.to.legacyAddresses[0].address

      if scope.transaction.to.externalAddresses?
        # to_address = scope.transaction.to.externalAddresses.addressWithLargestOutput
        to_address = scope.transaction.to.externalAddresses[0].address
      address = null

      if scope.transaction.intraWallet
        scope.action = "MOVED_BITCOIN_TO"
        if scope.transaction.to.account?
          scope.address = Wallet.accounts[parseInt(scope.transaction.to.account.index)].label
        else
          if to_name = Wallet.getAddressBookLabel(to_address)
            scope.address = to_name
          else
            scope.address = to_address
      else
        if scope.transaction.result < 0
          scope.action = "SENT_BITCOIN_TO"
          if scope.transaction.to.externalAddresses?
            if to_name = Wallet.getAddressBookLabel(to_address)
              scope.address = to_name
            else
              scope.address = to_address
          else if scope.transaction.to.email?
            scope.address = scope.transaction.to.email.email
          else if scope.transaction.to.mobile?
            scope.address = scope.transaction.to.mobile.number
        else
          scope.action = "RECEIVED_BITCOIN_FROM"
          if from_name = Wallet.getAddressBookLabel(to_address)
            scope.address = from_name
          else
            scope.address = from_address
  }
)
