walletApp.directive('activityFeed', () ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    scope: {}
    link: (scope, elem, attrs) ->
  }
)

