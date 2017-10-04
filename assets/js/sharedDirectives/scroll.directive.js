angular
  .module('shared')
  .directive('scroll', scroll);

scroll.$inject = ['AngularHelper'];

function scroll (AngularHelper) {
  const directive = {
    restrict: 'A',
    scope: {
      posY: '='
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    angular.element(elem).bind('scroll', () => {
      scope.posY = document.getElementById(attrs.id).scrollTop;
      AngularHelper.$safeApply();
    });
  }
}
