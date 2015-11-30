angular.module('walletApp').directive "uiLadda",  ($timeout, $compile, $translate) ->
  # angular-ladda doesn't work nicely with ui-bootstrap
  return {
    restrict: "A"
    replace: false
    scope: {
      laddaTranslate: "@"
      uiLadda: "="
    }
    template: '<span class="ladda-label" translate="{{ translation }}"></span><span class="ladda-spinner"><div class="spinner"></div></span>'
    link: (scope, element, attrs) ->
      element.addClass("ladda-button")
      element.attr("ladda", attrs["uiLadda"])

      element.removeAttr("ui-ladda")
      element.removeAttr("ng-click") # Prevent action from being called twice

      $compile(element)(scope)

      scope.translation = null

      $translate(scope.laddaTranslate).then (translation) ->
        scope.translation = translation;

      scope.$watch "uiLadda", (newVal) ->
        if newVal
          element.attr("data-loading", true)
          element.attr("disabled", true)
        else
          element.removeAttr("data-loading")
          element.removeAttr("disabled")
  }
