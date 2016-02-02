
angular
  .module('walletApp')
  .directive('scrollInView', scrollInView);

scrollInView.$inject = ['$window'];

function scrollInView($window) {
  const directive = {
    restrict: 'E',
    replace: true,
    templateUrl: 'templates/scroll-in-view.jade',
    link: link
  };

  return directive;

  function link(scope, elem, attrs) {
    scope.img = attrs['img']

    let itemTop = elem[0].getBoundingClientRect().top;

    scope.scroll = () => {
      let windowBottom = $window.pageYOffset + $window.innerHeight;

      if ( windowBottom > itemTop ) {
        scope.isActive = true
        console.log(scope.isActive)
      }
    }

    angular.element($window).bind('scroll', scope.scroll)
    scope.scroll()
  }
}