angular
  .module('walletApp.core')
  .factory('MyBlockchainApi', MyBlockchainApi);

function MyBlockchainApi ($q, $interval) {
  let defer = $q.defer();

  let stop = $interval(
    () => {
      if (typeof Blockchain !== 'undefined') {
        defer.resolve(Blockchain.API);
        $interval.cancel(stop);
      }
    },
    100
  );

  return defer.promise;
}
