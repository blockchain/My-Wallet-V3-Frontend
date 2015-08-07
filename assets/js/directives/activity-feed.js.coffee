walletApp.directive('activityFeed', ($http, Wallet, Activity) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    link: (scope, elem, attrs) ->
      scope.status = Wallet.status
      scope.activities = Activity.activities

      scope.$watch (-> Activity.activities), (activities) ->
        scope.activities = activities

      scope.$watch 'status.didLoadTransactions', (didLoad) ->
        Activity.updateTxActivities() if didLoad

  }
)
