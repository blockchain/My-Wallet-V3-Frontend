
angular
  .module('walletApp')
  .directive('adverts', adverts);

adverts.$inject = ['Adverts', '$window'];

function adverts (Adverts, $window) {
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
      $window.open(ad.url, '_blank');
    };
  }
}
