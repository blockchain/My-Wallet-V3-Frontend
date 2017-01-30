
angular
  .module('walletApp')
  .directive('adverts', adverts);

adverts.$inject = ['Adverts', '$rootScope'];

function adverts (Adverts, $rootScope) {
  const directive = {
    restrict: 'E',
    replace: 'true',
    scope: {},
    templateUrl: 'templates/adverts.jade',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    scope.ads = Adverts.ads;
    Adverts.fetchOnce();

    scope.visit = (ad) => {
      $rootScope.safeWindowOpen(ad.link);
    };
  }
}
