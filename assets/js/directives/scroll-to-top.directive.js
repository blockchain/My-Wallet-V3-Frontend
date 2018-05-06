angular
  .module('walletDirectives')
  .directive('scrollToTop', scrollToTop);

function scrollToTop ($window) {
  const directive = {
    restrict: 'A',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    let action = (newVal, oldVal) => {
      if (newVal !== oldVal) elem[0].scrollTop = 0;
    };

    scope.$watch(() => $window.location.hash, action);
  }
}
