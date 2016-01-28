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

      scope.getLabels = (tx) ->
        return if !tx or !tx.processedInputs or !tx.processedOutputs
        formatted = Wallet.formatTransactionCoins(tx)
        outputsLabel = ""
        if formatted.outputs && formatted.outputs.length > 0
          outputsLabel = formatted.outputs[0].label
        if formatted.outputs.length > 1
          outputsLabel = $translate.instant('RECIPIENTS', { n: formatted.outputs.length })

        if tx.txType == 'sent'
          return {
            primary: scope.primaryLabel = outputsLabel
            secondary: scope.secondaryLabel = formatted.input.label
          }
        else
          return {
            primary: scope.primaryLabel = formatted.input.label
            secondary: scope.secondaryLabel = outputsLabel
          }

      scope.$watch 'search', (search) ->
        return unless search?
        s = search.toLowerCase()
        searchInAddress = scope.primaryLabel.toLowerCase().search(s) > -1
        searchInOther = scope.secondaryLabel.toLowerCase().search(s) > -1
        scope.tx.toggled = !searchInAddress && searchInOther

  }
)
