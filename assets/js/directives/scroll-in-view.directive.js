
angular
  .module('walletApp')
  .directive('scrollInView', scrollInView);

scrollInView.$inject = ['$window', '$timeout'];

function scrollInView($window, $timeout) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/scroll-in-view.jade',
    scope: {},
    img: '@',
    link: link
  };

  return directive;

  function link(scope, elem, attrs) {
    scope.img = attrs['img']
    scope.shadow = attrs['shadow']
    scope.transactions = attrs['transactions']

    angular.element(document).ready(() => {

      $timeout(() => {
        let itemTop = elem[0].getBoundingClientRect().top;

        scope.scroll = () => {
          let windowBottom = $window.pageYOffset + $window.innerHeight;

          if ( windowBottom > itemTop ) {
            scope.isActive = true;
          } else {
            scope.isActive = false;
          }
          scope.$apply()
        }

        angular.element($window).bind('scroll', scope.scroll)
        scope.scroll()
      }, 10);
    });

  }
}