angular
  .module('walletDirectives')
  .directive('preventEvent', preventEvent);

function preventEvent () {
  return {
    restrict: 'A',
    scope: false,
    link
  };

  function link (scope, elem, attrs) {
    let eventToPrevent = attrs.preventEvent;
    elem.on(eventToPrevent, (event) => event.preventDefault());
  }
}
