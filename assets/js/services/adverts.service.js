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
    let advertsFeed = $rootScope.apiDomain + 'ads/get?wallet=true&n=2';
    $http.get(advertsFeed)
      .success(data => {
	service.ads.push.apply(service.ads, data);
      });
  }
}
