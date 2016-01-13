angular.module('walletApp').directive('singleClickSelect', ($window) ->
  {
    restrict: "A"
    link: (scope, elem, attrs) ->
      scope.highlighted = false
      scope.browserCanExecCommand = (browserDetection().browser == "chrome" && browserDetection().version > 42) || (browserDetection().browser == "firefox" && browserDetection().version > 40) || (browserDetection().browser == "ie" && browserDetection().version > 10)

      scope.select = () ->
        text = elem[0]

        range = $window.document.createRange()
        range.setStartBefore(text.firstChild)
        range.setEndAfter(text.lastChild)

        selection = $window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

        unless $window.getSelection().toString() == ''
          scope.highlighted = true

        if scope.browserCanExecCommand
          $window.document.execCommand('copy')

      elem.bind('click', ->
        scope.select()
        scope.$digest()
      )

      action = (newVal, oldVal) ->
        scope.highlighted = false if newVal != oldVal

      address = -> elem[0].textContent.toString()

      scope.$watch address, action

  }
)
