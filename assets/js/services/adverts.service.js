angular
  .module('walletApp')
  .factory('Adverts', Adverts);

Adverts.$inject = ['$http', 'Env'];

function Adverts ($http, Env) {
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
    if (!Env.apiDomain.endsWith('.blockchain.info/')) {
      return;
    }

    let advertsFeed = Env.apiDomain + 'bci-ads/get?wallet=true&n=2';
    return $http.get(advertsFeed)
      .success(function (data) {
        data.forEach(function (ad) {
          if (!/^data:image\/(png|jpg|jpeg|gif);base64,/.test(ad.data) ||
              !angular.isNumber(ad.id) ||
              !/^[0-9a-zA-Z ]*$/.test(ad.name)) {
            return;
          }

          service.ads.push(ad);
        });
      });
  }
}
