walletApp.directive('securityBadge', () ->
  {
    restrict: "E"
    replace: 'true'
    scope: {
      level: '='
      pending: '='
    }
    templateUrl: 'templates/security-badge.jade'
    link: (scope, elem, attrs) ->
      scope.$watch "level + pending", ->
        if scope.level == 1
          scope.badgeUrl = "img/badge-basic"
        else if scope.level == 2
          scope.badgeUrl = "img/badge-middle"
        else if scope.level == 3
          scope.badgeUrl = "img/badge-high"
        
        if scope.pending
          scope.badgeUrl += "-pending"
        
        scope.badgeUrl  += ".png"
  }
)