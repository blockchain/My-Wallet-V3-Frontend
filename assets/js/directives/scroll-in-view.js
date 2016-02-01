
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

    $window.on('scroll', function() {
      console.log('here');
    })
  }
}
