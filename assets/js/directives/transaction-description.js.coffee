angular.module('walletApp').directive('transactionDescription', ($translate, $rootScope, Wallet, $compile, $sce) ->
  {
    restrict: "E"
    replace: 'false'
    scope: {
      tx: '=transaction'
      search: '=highlight'
    }
    templateUrl: 'templates/transaction-description.jade'
    link: (scope, elem, attrs) ->

      scope.getAction = (txType) ->
        switch txType
          when 'sent'
            return 'SENT'
          when 'received'
            return 'RECEIVED_BITCOIN_FROM'
          when 'transfer'
            return 'MOVED_BITCOIN_TO'

      formatLabel = (coins, keepChange) ->
        used = {}
        coins
          .filter((coin) -> !coin.change || keepChange)
          .map((coin) -> coin.label || coin.address)
          .filter((label) ->
            didUse = used[label] == true
            used[label] = true
            return !didUse
          ).join(', ')

      scope.getPrimaryLabel = (tx) ->
        if tx.txType == 'sent'
          return formatLabel(tx.processedOutputs)
        else
          return formatLabel(tx.processedInputs, true)

      scope.getSecondaryLabel = (tx) ->
        if tx.txType == 'sent'
          return formatLabel(tx.processedInputs, true)
        else
          return formatLabel(tx.processedOutputs)

      scope.primaryLabel = scope.getPrimaryLabel(scope.tx)
      scope.secondaryLabel = scope.getSecondaryLabel(scope.tx)

      scope.$watch 'search', (search) ->
        return unless search?
        s = search.toLowerCase()
        searchInAddress = scope.primaryLabel.toLowerCase().search(s) > -1
        searchInOther = scope.secondaryLabel.toLowerCase().search(s) > -1
        scope.tx.toggled = !searchInAddress && searchInOther

  }
)
