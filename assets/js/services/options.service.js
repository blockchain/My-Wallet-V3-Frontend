angular
  .module('options', [])
  .factory('Options', Options);

Options.$inject = ['$http'];

function Options ($http) {
  let _options = null;

  const service = {
    get: get
  };

  function get () {
    if (_options) {
      return Promise.resolve(_options);
    }
    return $http.get('/Resources/wallet-options.json')
      .success((res) => {
        _options = res;
      })
      .then(() => {
        return _options;
      });
  }

  return service;
}
