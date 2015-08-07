walletApp.directive('activityFeed', (Wallet) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    link: (scope, elem, attrs) ->
      scope.status = Wallet.status
      scope.activities = []

      scope.getTxMessage = (tx) ->
        if tx.intraWallet
          return 'TRANSFERRED'
        else
          return if tx.result < 0 then 'SENT' else 'RECEIVED'

      scope.loadActivityFeed = () ->
        scope.activities = Wallet.transactions.slice(0, 8)
          .map (tx) ->
            type: 0
            title: 'TRANSACTION'
            icon: 'ti-layout-list-post'
            time: tx.txTime * 1000
            message: scope.getTxMessage(tx)
            result: Math.abs(tx.result)

      scope.$on 'updateActivityFeed', ->
        scope.loadActivityFeed()

      didLoadTxs = scope.$watch 'status.didLoadTransactions', (didLoad) ->
        if didLoad
          scope.loadActivityFeed()
          didLoadTxs()

  }
)
