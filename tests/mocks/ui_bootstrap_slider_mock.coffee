angular.module("ui.bootstrap-slider", []).directive "slider", [
  "$parse"
  "$timeout"
  ($parse, $timeout) ->
    return (
      restrict: "AE"
      replace: true
      template: "<input type=\"text\" />"
      require: "ngModel"
      link: ($scope, element, attrs, ngModelCtrl) ->
    )
]