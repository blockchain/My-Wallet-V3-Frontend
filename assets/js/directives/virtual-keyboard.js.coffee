angular.module('walletApp').directive('virtualKeyboard', ($document, $window) ->
  {
    restrict: "E"
    replace: 'true'
    require: "ngModel"
    scope: {
      ngModel: '='
    }
    templateUrl: 'templates/virtual-keyboard.jade'
    link: (scope, elem, attrs, ngModel) ->
      scope.keysLowerCase = [
        ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="]
        ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"]
        ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'", "\\"]
        ["`", "z", "x", "c", "v", "b", "n", "m", ",", ".", "/"]
      ]

      scope.keysUpperCase = [
        ["!", "@", "#", "$", "%", "^", "&", "*", "(", ")", "_", "+"]
        ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "{", "}"]
        ["A", "S", "D", "F", "G", "H", "J", "K", "L", ":", "\"", "|"]
        ["~", "Z", "X", "C", "V", "B", "N", "M", "<", ">", "?"]
      ]

      scope.caps = false

      scope.toggleCaps = () ->
        scope.caps = !scope.caps

      scope.press = (key) ->
        ngModel.$setViewValue(ngModel.$viewValue + key)

      scope.backspaceEventHandler = (event) ->
        selection = $window.getSelection().toString()
        if event.which == 8
          event.preventDefault()
          if selection != ''
            ngModel.$setViewValue('')
          else
            ngModel.$setViewValue(ngModel.$viewValue.slice(0, -1))
      $document.bind 'keydown keypress', scope.backspaceEventHandler

      scope.$on '$destroy', () ->
        $document.unbind 'keydown keypress', scope.backspaceEventHandler
  }
)
