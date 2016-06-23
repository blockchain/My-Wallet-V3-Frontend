angular
  .module('adverts', [])
  .factory('Adverts', Adverts);

Adverts.$inject = ['$http', '$rootScope'];

function Adverts ($http, $rootScope) {
  const service = {
    ads: [],
    didFetch: false,
    fetchOnce: fetchOnce,
    fetch: fetch
  };
  return service;

  function fetchOnce () {
    if (!service.didFetch) {
      service.fetch();
      service.didFetch = true;
    }
  }

  function fetch () {
    let advertsFeed = $rootScope.rootURL + 'adverts_feed?wallet_version=3';
    $http.get(advertsFeed)
      .success(data => {
        let adverts = data.partners.home_buttons.splice(0);
        service.ads.push(randFromArray(adverts));
        service.ads.push(randFromArray(adverts));
      });
  }

  function randFromArray (array) {
    return array.splice(Math.floor(Math.random() * array.length), 1)[0];
  }
}
