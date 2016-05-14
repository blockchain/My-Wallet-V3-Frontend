angular
  .module('walletApp.core')
  .factory('MyBlockchainSettings', MyBlockchainSettings);

function MyBlockchainSettings ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.BlockchainSettingsAPI);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
