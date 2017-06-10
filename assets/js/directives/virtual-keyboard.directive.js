
angular
  .module('walletDirectives')
  .directive('virtualKeyboard', virtualKeyboard);

function virtualKeyboard ($document, $window) {
  const directive = {
    restrict: 'E',
    replace: true,
    require: 'ngModel',
    scope: {
      ngModel: '='
    },
    templateUrl: 'templates/virtual-keyboard.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs, ngModel) {
    scope.keysLowerCase = [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', '\\'],
      ['`', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
    ];
    scope.keysUpperCase = [
      ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '_', '+'],
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '{', '}'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ':', '"', '|'],
      ['~', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '<', '>', '?']
    ];
    scope.caps = false;

    scope.toggleCaps = () => scope.caps = !scope.caps;
    scope.press = (key) => ngModel.$setViewValue(ngModel.$viewValue + key);

    scope.backspaceEventHandler = (event) => {
      let selection = $window.getSelection().toString();
      if (event.which === 8) {
        event.preventDefault();
        let newVal = selection === '' ? ngModel.$viewValue.slice(0, -1) : '';
        ngModel.$setViewValue(newVal);
      }
    };

    $document.bind('keydown keypress', scope.backspaceEventHandler);
    scope.$on('$destroy', () => {
      $document.unbind('keydown keypress', scope.backspaceEventHandler);
    });
  }
}
