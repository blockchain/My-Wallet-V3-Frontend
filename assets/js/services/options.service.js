angular
  .module('walletApp')
  .factory('Options', Options);

Options.$inject = ['$http', '$rootScope', 'BlockchainConstants', 'Env'];

function Options ($http, $rootScope, BlockchainConstants, Env) {
  let fetchedOptions = false;

  const service = {
    get: get,
    get didFetch () {
      return fetchedOptions;
    },
    options: {}
  };

  function get () {
    return Env.then(env => {
      let file = env.isProduction ? 'wallet-options' : (BlockchainConstants.NETWORK === 'testnet' ? 'wallet-options-testnet' : 'wallet-options-debug');
      let url = `/Resources/${file}.json`;
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
    });
  }

  return service;
}
