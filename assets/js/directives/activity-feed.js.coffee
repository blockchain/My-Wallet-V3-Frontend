angular.module('walletApp').directive('activityFeed', ($http, Wallet, Activity) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    link: (scope, elem, attrs) ->
      scope.status = Wallet.status
      scope.activities = Activity.activities
      scope.loading = true

      scope.$watch (-> Activity.activities), (activities) ->
        scope.activities = activities

      scope.$watch 'status.didLoadTransactions', (didLoad) ->
        if didLoad
          Activity.updateTxActivities()
          scope.loading = false

      scope.$watch 'status.didLoadSettings', (didLoad) ->
        Activity.updateLogActivities() if didLoad

  }
)
