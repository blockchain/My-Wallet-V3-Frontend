
angular
  .module('walletApp')
  .directive('onEnter', onEnter);

function onEnter () {
  const directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    var action = (event) => {
      if (event.which === 13) {
        event.preventDefault();
        scope.$eval(attrs.onEnter, { 'event': event });
      }
    };

    elem.bind('keydown keypress', action);
    scope.$on('$destroy', () => {
      elem.unbind('keydown keypress', action);
    });
  }
}
