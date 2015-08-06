walletApp.directive('activityFeed', (Wallet) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    scope: {}
    link: (scope, elem, attrs) ->

      scope.$on 'updateActivityFeed', ->
        console.log 'Updating activity feed'

  }
)
