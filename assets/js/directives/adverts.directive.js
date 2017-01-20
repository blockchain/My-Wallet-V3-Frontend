
angular
  .module('walletApp')
  .directive('adverts', adverts);

adverts.$inject = ['Adverts', '$window', '$rootScope'];

function adverts (Adverts, $window, $rootScope) {
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
      var url = $rootScope.apiDomain + 'ads/out?id=' + ad.id;
      $window.open(url, '_blank');
    };
  }
}
