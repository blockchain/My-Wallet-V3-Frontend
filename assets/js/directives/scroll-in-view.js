
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

    angular.element($window).bind('scroll', function() {
      console.log('here');

      scope.$apply()
    })
  }
}

// app = angular.module('myApp', []);
// app.directive("scroll", function ($window) {
//     return function(scope, element, attrs) {
//         angular.element($window).bind("scroll", function() {
//              if (this.pageYOffset >= 100) {
//                  element.addClass('min');
//                  console.log('Scrolled below header.');
//              } else {
//                  element.removeClass('min');
//                  console.log('Header is in view.');
//              }
//         });
//     };
// });