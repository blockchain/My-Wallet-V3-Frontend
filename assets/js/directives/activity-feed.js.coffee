walletApp.directive('activityFeed', ($http, Wallet, Activity) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    link: (scope, elem, attrs) ->
      scope.status = Wallet.status
      scope.activities = Activity.activities

      Activity.updateLogActivities()

      scope.$on 'updateActivityFeed', ->
        Activity.updateAllActivities()

      scope.$watch (() -> Activity.activities), (activities) ->
        scope.activities = activities

      didLoadTxs = scope.$watch 'status.didLoadTransactions', (didLoad) ->
        if didLoad
          Activity.updateTxActivities()
          didLoadTxs()

  }
)
