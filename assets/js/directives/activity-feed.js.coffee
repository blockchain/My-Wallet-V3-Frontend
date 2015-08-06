walletApp.directive('activityFeed', ($cookies, $translate, Wallet) ->
  {
    restrict: "E"
    replace: true
    templateUrl: "templates/activity-feed.jade"
    scope: {}
    link: (scope, elem, attrs) ->
      return unless Wallet.user.uid
      scope.cookieName = 'activity-' + Wallet.user.uid.split('-')[0]
      scope.activities = ($cookies.getObject(scope.cookieName) || [])

      scope.translateParts = (str) ->
        str.split(' ').map($translate.instant).join(' ')

      scope.$on 'updateActivityList', ->
        scope.activities = ($cookies.getObject(scope.cookieName) || [])

  }
)
