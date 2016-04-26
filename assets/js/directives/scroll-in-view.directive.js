
angular
  .module('walletApp')
  .directive('scrollInView', scrollInView);

scrollInView.$inject = ['$window', '$timeout'];

function scrollInView ($window, $timeout) {
  const directive = {
    restrict: 'E',
    templateUrl: 'templates/scroll-in-view.jade',
    replace: true,
    scope: {},
    img: '@',
    link: link
  };

  return directive;

  function link (scope, elem, attrs) {
    scope.img = attrs['img'];
    scope.shadow = attrs['shadow'];
    scope.transactions = attrs['transactions'];

    scope.initScroll = () => {
      $timeout(() => {
        let windowBottom = $window.pageYOffset + $window.innerHeight;
        let itemTop = elem[0].getBoundingClientRect().top;
        scope.onScroll(windowBottom, itemTop);
      }, 10);
    };

    scope.onScroll = (bottom, top) => {
      if (bottom > top) scope.isActive = true;
      else scope.isActive = false;
      scope.$apply();
    };

    angular.element(document).ready(scope.initScroll);
    angular.element($window).bind('scroll', scope.initScroll);
  }
}
