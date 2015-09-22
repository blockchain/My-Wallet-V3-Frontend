angular.module('walletApp').directive('scrollToTop', ($window) ->
  {
    restrict: "A"
    link: (scope, elem, attrs) ->

      watcher = -> $window.location.hash

      action = (newVal, oldVal) ->
        elem[0].scrollTop = 0 if newVal != oldVal

      scope.$watch watcher, action

  }
)
