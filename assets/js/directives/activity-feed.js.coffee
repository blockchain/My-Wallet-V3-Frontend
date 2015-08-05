walletApp.directive('activityFeed', ($cookies, $translate) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    scope: {}
    link: (scope, elem, attrs) ->
      scope.activities = ($cookies.getObject('activity') || [])

      scope.translateParts = (str) ->
        str.split(' ').map($translate.instant).join(' ')

      scope.$on 'updateActivityList', ->
        scope.activities = ($cookies.getObject('activity') || [])

  }
)
