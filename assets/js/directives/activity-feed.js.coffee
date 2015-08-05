walletApp.directive('activityFeed', ($cookies) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    scope: {}
    link: (scope, elem, attrs) ->
      scope.activities = ($cookies.getObject('activity') || [])
  }
)
