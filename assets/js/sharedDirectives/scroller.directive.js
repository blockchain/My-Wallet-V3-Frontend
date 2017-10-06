angular
  .module('shared')
  .directive('scroller', scroller);

scroller.$inject = ['AngularHelper', '$document'];

function scroller (AngularHelper, $document) {
  const directive = {
    restrict: 'A',
    scope: {
      posY: '=',
      elemId: '='
    },
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    angular.element(elem).bind('scroll', () => {
      scope.posY = $document[0].getElementById(attrs.elemId).scrollTop;
      AngularHelper.$safeApply();
    });
  }
}
