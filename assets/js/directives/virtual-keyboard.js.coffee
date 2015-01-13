walletApp.directive('virtualKeyboard', () ->
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
  }
)