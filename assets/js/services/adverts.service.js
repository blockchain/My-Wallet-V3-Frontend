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
    if (!$rootScope.apiDomain.endsWith('.blockchain.info/')) {
      return;
    }

    let advertsFeed = $rootScope.apiDomain + 'ads/get?wallet=true&n=2';
    $http.get(advertsFeed)
      .success(function (data) {
        data.forEach(function (ad) {
          if (!/^data:image\/(png|jpg|jpeg|gif);base64,/.test(ad.data) || !angular.isNumber(ad.id)) {
            return;
          }

          service.ads.push(ad);
        });
      });
  }
}
