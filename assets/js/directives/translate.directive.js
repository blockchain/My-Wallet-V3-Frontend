angular
  .module('walletApp')
  .directive('translate', translate);

function translate () {
  const directive = {
    restrict: 'A',
    compile: compile,
    priority: 1
  };
  return directive;

  function compile (elem, attrs) {
    if (attrs.translate === 'no' || attrs.translate === 'yes') {
      // HTML5 tag. Prevent angular-translate from processing this.
      attrs.translate = undefined;
    }
  }
}
