angular
  .module('options', [])
  .factory('Options', Options);

Options.$inject = ['$http', '$rootScope'];

function Options ($http, $rootScope) {
  let fetchedOptions = false;

  const service = {
    get: get,
    get didFetch () {
      return fetchedOptions;
    },
    options: {}
  };

  function get () {
    let url;
    if ($rootScope.buySellDebug) {
      url = '/Resources/wallet-options-debug.json';
    } else {
      url = '/Resources/wallet-options.json';
    }
    if (fetchedOptions) {
      return Promise.resolve(service.options);
    }
    return $http.get(url)
      .success((res) => {
        service.options = res;
        fetchedOptions = true;
      })
      .then(() => {
        return service.options;
      });
  }

  return service;
}
