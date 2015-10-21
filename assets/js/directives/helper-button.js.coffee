angular.module('walletApp').directive('helperButton', ($translate) ->
  {
    restrict: "E"
    replace: true
    scope: {
      content: '@'
      url: '@'
      placement: '@'
    }
    templateUrl: "templates/helper-button.jade"
    link: (scope, elem, attrs) ->
      scope.isActive = false

      scope.warning = attrs.warning?

      $translate(scope.content).then (translation) ->
        scope.content = translation

      scope.helperText =
        templateUrl: 'templates/helper-popover.jade'
        placement: scope.placement || 'right'

      scope.toggleActive = ()->
        scope.isActive = !scope.isActive

  }
)
