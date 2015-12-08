angular.module('walletApp').directive "uiLadda",  ($timeout, $compile, $translate) ->
  # angular-ladda doesn't work nicely with ui-bootstrap
  return {
    restrict: "A"
    replace: false
    scope: {
      laddaTranslate: "@"
      uiLadda: "="
      disabled: "=ngDisabled"
    }
    templateUrl: () -> 'templates/ui-ladda.jade'
    link: (scope, element, attrs) ->
      element.addClass("ladda-button")
      element.removeAttr("ng-click") # Prevent action from being called twice

      scope.translation = null

      $translate(scope.laddaTranslate).then (translation) ->
        scope.translation = translation;

      scope.$watch "uiLadda + disabled", (newVal) ->
        if scope.uiLadda
          element.attr("data-loading", true)
          element.attr("disabled", true)
        else
          element.removeAttr("data-loading")
          if !scope.disabled
            element.removeAttr("disabled")
  }
