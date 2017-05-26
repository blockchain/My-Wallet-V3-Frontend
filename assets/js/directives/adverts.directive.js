
angular
  .module('walletApp')
  .directive('adverts', adverts);

adverts.$inject = ['Adverts', 'Env'];

function adverts (Adverts, Env) {
  const directive = {
    restrict: 'E',
    replace: 'true',
    scope: {},
    templateUrl: 'templates/adverts.pug',
    link: link
  };
  return directive;

  function link (scope, elem, attrs) {
    Env.then(env => {
      scope.baseUrl = env.apiDomain + 'ads/out?id=';
    });
    scope.ads = Adverts.ads;
    Adverts.fetchOnce();
  }
}
